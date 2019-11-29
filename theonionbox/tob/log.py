from typing import Dict
# from __future__ import absolute_import
from time import time, strftime, mktime, localtime
from collections import deque
import uuid
import logging
from logging.handlers import MemoryHandler
import functools
import sys
from threading import RLock
from stem import ProtocolError

from tob.deviation import getTimer
import os.path

normalize_level = {'DEBUG': 'DEBUG',
                   'INFO': 'INFO',
                   'NOTICE': 'NOTICE',
                   'WARNING': 'WARNING',
                   'ERROR': 'ERROR',
                   'WARN': 'WARNING',
                   'ERR': 'ERROR'
}

level_box_to_tor = {'DEBUG': logging.DEBUG,
                    'INFO': logging.INFO,
                    'NOTICE': 25,
                    'WARN': logging.WARNING,
                    'ERR': logging.ERROR
}

py = sys.version_info
py32 = py >= (3, 2, 0)
py34 = py >= (3, 4, 0)
py342 = py >= (3, 4, 2)


# Thanks to 'Mad Physicist'
# http://stackoverflow.com/questions/2183233/how-to-add-a-custom-loglevel-to-pythons-logging-facility
def addLoggingLevel(levelName, levelNum, methodName=None):
    """
    Comprehensively adds a new logging level to the `logging` module and the
    currently configured logging class.

    `levelName` becomes an attribute of the `logging` module with the value
    `levelNum`. `methodName` becomes a convenience method for both `logging`
    itself and the class returned by `logging.getLoggerClass()` (usually just
    `logging.Logger`). If `methodName` is not specified, `levelName.lower()` is
    used.

    To avoid accidental clobberings of existing attributes, this method will
    raise an `AttributeError` if the level name is already an attribute of the
    `logging` module or if the method name is already present

    Example
    -------
    >>> addLoggingLevel('TRACE', logging.DEBUG - 5)
    >>> logging.getLogger(__name__).setLevel("TRACE")
    >>> logging.getLogger(__name__).trace('that worked')
    >>> logging.trace('so did this')
    >>> logging.TRACE
    5

    """
    if not methodName:
        methodName = levelName.lower()

    if hasattr(logging, levelName):
       raise AttributeError('{} already defined in logging module'.format(levelName))
    if hasattr(logging, methodName):
       raise AttributeError('{} already defined in logging module'.format(methodName))
    if hasattr(logging.getLoggerClass(), methodName):
       raise AttributeError('{} already defined in logger class'.format(methodName))

    # This method was inspired by the answers to Stack Overflow post
    # http://stackoverflow.com/q/2183233/2988730, especially
    # http://stackoverflow.com/a/13638084/2988730
    def logForLevel(self, message, *args, **kwargs):
        if self.isEnabledFor(levelNum):
            self._log(levelNum, message, args, **kwargs)
    def logToRoot(message, *args, **kwargs):
        logging.log(levelNum, message, *args, **kwargs)

    logging.addLevelName(levelNum, levelName)
    setattr(logging, levelName, levelNum)
    setattr(logging.getLoggerClass(), methodName, logForLevel)
    setattr(logging, methodName, logToRoot)


# Add Level to be inline with the Tor levels (DEBUG - INFO - NOTICE - WARN(ing) - ERROR)
addLoggingLevel('NOTICE', logging.INFO + 5)
# This one is to be inline with STEM's logging levels:
addLoggingLevel('TRACE', logging.DEBUG - 5)


class FilterCallback(object):

    filter_callback = None

    def __init__(self, filter_function):
        self.filter_callback = filter_function

    def filter(self, record):
        return self.filter_callback(record)


# this is the callback to receive the events from tor / stem
def handle_tor_event(event, logger):

    timestamp = event.arrived_at

    timer = getTimer()
    timestamp = timer.compensate(timestamp)

#    if compensate_deviation is True:
#        timestamp = self._time(timestamp)

    js_time_stamp = int(timestamp*1000)                # ms for JS!

    level = event.runlevel

    extra = {'source': 'tor',
             'source_time': js_time_stamp}

    # translate from Tor's runlevel
    level = event.runlevel

    try:
        # this could have been done by calling logging.getLevelName,
        # yet the workaround to make this work in 3.4.0 <= version < 3.4.2
        # is ridiculous! => https://docs.python.org/3/library/logging.html#logging.getLevelName
        logger.log(level_box_to_tor[level], msg=event.message, extra=extra)

        # This might indicate an attempt to scan the ports of a hidden service!!
        if 'connection_edge_process_relay_cell (at origin) failed' in event.message:
            extra['source'] = 'box'
            logger.log(level_box_to_tor['NOTICE'],
                       msg="If you're running a hidden service this could "
                           "indicate a failed attempt to establish a connection!",
                       extra=extra)

    except Exception as exc:
        boxLog = logging.getLogger('theonionbox')
        boxLog.exception('Error while logging Tor event: level={} | msg={} | extra={}'
                         .format(level, event.message, extra), exc_info=True)


class LoggingManager(object):

    class _EventSwitchMonitor(object):

        # This is a helper class to note and count the number of clients for each event type.
        # It ensures, that we can switch Tor's event system as requested and do not need to transfer
        # each & every event (even if none is requesting this!)

        def __init__(self):
            self.sessions_for_level = {}

        def switch(self, session_id, level, status=True):

            # returns True to indicate that an event_listener should be registered to tor
            # or removed (because none wants to receive it anymore)

            if level not in self.sessions_for_level:
                self.sessions_for_level[level] = []

            sfl = self.sessions_for_level[level]

            if status is True:

                if session_id in sfl:
                    return False        # already registered

                sfl.append(session_id)
                return len(sfl) == 1

            # else if status is False:
            try:
                sfl.remove(session_id)
                return len(sfl) == 0
            except ValueError:
                return False

        @property
        def status(self) -> Dict[str, bool]:
            status = {}
            for level, sessions in self.sessions_for_level.items():
                status[level] = len(sessions) > 0
            return status

    class _EventHandler(logging.Handler):

        # Custom Handler with integrated Filter according to Tor's Event system

        # the buffer (deque) to keep the events
        buffer = None

        # a dict of runlevel names (e.g. 'DEBUG') used to filter the incoming LogRecords
        levels = None

        # Flag to decide if the buffer should be cleared when flush() is called
        clear_at_flush = True

        def __init__(self, capacity=400, clear_at_flush=True):

            logging.Handler.__init__(self)
            self.buffer = deque(maxlen=capacity)

            self.levels = {}

            if py32:
                self.addFilter(self._filter)
            else:
                self.addFilter(FilterCallback(self._filter))

            self.clear_at_flush = clear_at_flush
            self.createLock()

        def switch(self, level, status=True):
            # set the information for filtering
            s = self.levels[level] if level in self.levels else None
            self.levels[level] = status
            return s != status

        def _filter(self, record):
            level = record.levelname
            return self.levels[level] if level in self.levels else False

        def emit(self, record):
            self.acquire()
            self.buffer.append(record)
            self.release()

        def flush(self, limit=None, encode=None):

            # this function cumulates same messages...

            retval = []
            self.acquire()

            last = None

            for record in self.buffer:

                msg = str(record.msg).strip()

                if last is not None:
                    if last['m'] == msg:
                        last['c'] += 1
                        continue
                    retval.append(last)

                last = {'s': record.source_time,
                        'l': record.levelname[0],
                        'm': msg,
                        't': record.source[0],
                        'c': 1
                        }

            if last is not None:
                retval.append(last)

            if self.clear_at_flush:
                    self.buffer.clear()

            self.release()
            return retval

        def flush_to_target(self, target, limit=None):

            count = 0
            self.acquire()
            for msg in self.buffer:
                target.emit(msg)
                count += 1
                if limit and count > limit:
                    break

            if self.clear_at_flush:
                self.buffer.clear()

            self.release()

        @property
        def status(self) -> Dict[str, bool]:
            return self.levels

    tor = None
    logger_name = None   # name of the logger of this node
    monitor = None
    clients = {}

    # This is the client-ID we use to store the messages of the
    # events "to be preserved"
    self_id = None
    preserved_handler = None

    # the levels and their default value
    levels = {'DEBUG': False,
              'INFO': False,
              'NOTICE': True,
              'WARNING': True,
              'ERROR': True,
              # 'BOX': True,
              }

    def __init__(self, controller=None, notice=True, warn=True, err=True):

        lgr = logging.getLogger('theonionbox')  # logging messages back to the box

        self.self_id = str(uuid.uuid4().hex)
        lgr.debug('LoggingManager created with id {}.'.format(self.self_id))

        self.logger_name = '{}@theonionbox'.format(self.self_id)

        self.tor = controller
        self.clients = {}

        self.monitor = self._EventSwitchMonitor()

        # This is necessary to ensure a different object for each runlevel
        torLog = logging.getLogger(self.logger_name)    # created with level 'WARNING'
        torLog.setLevel('DEBUG')

        self.event_handlers = {'DEBUG': functools.partial(handle_tor_event, logger=torLog),
                               'INFO': functools.partial(handle_tor_event, logger=torLog),
                               'NOTICE': functools.partial(handle_tor_event, logger=torLog),
                               'WARNING': functools.partial(handle_tor_event, logger=torLog),
                               'ERROR': functools.partial(handle_tor_event, logger=torLog)
                               }

        self.add_client(self.self_id, clear_at_flush=False)
        if notice != self.levels['NOTICE']:
            self.switch(self.self_id, 'NOTICE', notice)
        if warn != self.levels['WARNING']:
            self.switch(self.self_id, 'WARNING', warn)
        if err != self.levels['ERROR']:
            self.switch(self.self_id, 'ERROR', err)

    # def connect2tor(self, tor):
    #     if self.tor is not None:
    #         raise AttributeError('You may connect this manager to Tor only once!')
    #     self.tor = tor

    def add_client(self, session_id, capacity=400, clear_at_flush=True, levels = None):

        if levels is None:
            levels = self.levels

        # check if this session_id already has a handler
        try:
            mh = self.clients[session_id]
        except KeyError as ke:
            # if not: create a new MessageHandler
            mh = self._EventHandler(capacity, clear_at_flush)
            # ... and save this for later re-use
            self.clients[session_id] = mh

            # add the MessageHandler to Tor's Logger
            logging.getLogger(self.logger_name).addHandler(mh)

        # switch on the default events
        for level in levels:
            self.switch(session_id, level, levels[level])

        # now fill it with the preserved messages
        if session_id is not self.self_id:
            preserved_msgs = self.clients[self.self_id]
            preserved_msgs.flush_to_target(mh)

    def remove_client(self, session_id):

        try:
            # get the MessageHandler
            mh = self.clients[session_id]
        except KeyError:
            # we don't know it. No problem...
            return False

        # switch 'OFF' the event handling for this id
        for level in self.levels:
            self.switch(session_id, level, False)

        # remove & close the MessageHandler
        logging.getLogger(self.logger_name).removeHandler(mh)
        mh.close()

        # safe-delete the entry for this id
        if session_id in self.clients:
            del self.clients[session_id]

        return True

    def switch(self, session_id, level, status=True):

        lgr = logging.getLogger('theonionbox')

        try:
            level = normalize_level[level.upper()]
        except KeyError:
            lgr.warning("LoggingManager: Received request to switch unknown event level '{}'.".format(level))
            return False

        try:
            # get the MessageHandler
            mh = self.clients[session_id]
        except KeyError:
            # return if we don't know it
            return False

        # and switch the filter accordingly!
        if mh.switch(level, status) is True:

            lgr.debug("Switching '{}' for {} to {}".format(level, session_id, status))

            # switch the monitor; if the monitor returns 'True'...
            if self.monitor.switch(session_id, level, status) is True:
                self._switch(level, status)

        return True

    def shutdown(self):

        for session_id, handler in self.clients.items():

            # switch 'OFF' the event handling for this id
            for level in self.levels:
                self.switch(session_id, level, False)

            # remove & close the MessageHandler
            logging.getLogger(self.logger_name).removeHandler(handler)
            handler.close()

        self.clients = {}

    def get_events(self, session_id, encode=None):

        try:
            # get the MessageHandler
            mh = self.clients[session_id]
        except KeyError:
            return None

        # and return the stored messages!
        return mh.flush(encode=encode)

    def get_status(self, session_id):
        try:
            # get the MessageHandler
            mh = self.clients[session_id]
        except KeyError:
            return None

        # and return the stored messages!
        return mh.status

    def get_logger_name(self):
        return self.logger_name

    @property
    def logger(self):
        return logging.getLogger(self.logger_name)

    def get_id(self):
        return self.self_id

    def connect(self, controller):
        self.tor = controller
        for level, status in self.monitor.status.items():
            self._switch(level, status)

    def _switch(self, level, status):

        if self.tor is None:
            return

        lgr = logging.getLogger('theonionbox')

        # check if we have an event_handler for this, then ...
        if level in self.event_handlers:

            # ... add or remove the event_listener
            if status is True:

                # translate to Tor's events
                if level == 'WARNING':
                    tor_level = 'WARN'
                elif level == 'ERROR':
                    tor_level = 'ERR'
                else:
                    tor_level = level

                lgr.debug(
                    "Adding event_listener for Tor's runlevel '{}': {}".format(tor_level,
                                                                               self.event_handlers[level]))
                try:
                    self.tor.add_event_listener(self.event_handlers[level], tor_level)
                except ProtocolError as pe:
                    lgr.debug("Failed to add event_listener for runlevel '{}': {}".format(level, pe))

            if status is False:
                lgr.debug(
                    "Removing event_listener for runlevel '{}': {}".format(level, self.event_handlers[level]))
                try:
                    self.tor.remove_event_listener(self.event_handlers[level])
                except ProtocolError as pe:
                    lgr.debug("Failed to remove event_listener for runlevel '{}': {}".format(level, pe))

    def notice(self, message):
        self._log(message, 'NOTICE')

    # We could add here trace, debug and others later ... if necessary

    def _log(self, message, level):

        # The Unpacker of the log messages expects a certain format
        # ... thus we have to provide this here for standard messages.
        timer = getTimer()
        timestamp = timer.time()

        extra = {
            'source': 'box',
            'source_time': int(timestamp * 1000)  # ms for JS!
        }

        self.logger.log(level_box_to_tor[level], msg=message, extra=extra)

class ForwardHandler(MemoryHandler):

    tag = None  # each message being forwarded is tagged with this information

    def __init__(self, level=logging.NOTSET, tag=None):
        MemoryHandler.__init__(self, capacity=400)
        if tag is not None:
            self.tag = tag
        self.level = level
        if py32:
            self.addFilter(self._filter)
        else:
            self.addFilter(FilterCallback(self._filter))

    def shouldFlush(self, record):
        return self.target is not None

    def _filter(self, record):

        # mark this record as coming from 'tag'
        if self.tag is not None:
            record.source = self.tag

        # and provide appropriate js timestamp
        record.source_time = record.created * 1000

        return record.levelno >= self.level


# 20170409 RDW: Not used?
# John Spong @
# http://stackoverflow.com/questions/17931426/strip-newline-and-white-spaces-from-python-logger-messages
class WhitespaceRemovingFormatter(logging.Formatter):
    def format(self, record):
        # record.msg = record.msg.strip()
        record.msg = record.getMessage().strip()
        return super(WhitespaceRemovingFormatter, self).format(record)


# 20170409 RDW: Not used?
class ClientFormatter(logging.Formatter):

    def format(self, record):
        msg = record.getMessage().strip()
        lvlname = record.levelname

        out_lvlname = lvlname
        if lvlname == 'WARNING':
            out_lvlname = 'WARN'
        elif lvlname == 'NOTICE':
            out_lvlname = ''

        # https://en.wikipedia.org/wiki/ANSI_escape_code
        colorcodes = {
            'TRACE': '\033[35m',      # magenta
            'DEBUG': '\033[37m',      # light gray
            'INFO': '\033[94m',       # light blue
            'NOTICE': '',             # default
            'WARNING': '\033[91m',    # light red
            'ERROR': '\033[93;1m'     # yellow (bold)
        }

        out = ' ' * 8
        if out_lvlname != '':
            out = ('[{}]' + out).format(out_lvlname)[:8]

        if msg != '':
            out += strftime('%H:%M:%S', localtime(record.created)) + '.{:0=3d} '.format(int(record.msecs))
            out += msg

            if lvlname in colorcodes:
                out = colorcodes[lvlname] + out + '\033[0m'

        return out


def as_single_line(msg):
    return ' '.join(str(msg).split())


def colorize(msg, record):

    # https://en.wikipedia.org/wiki/ANSI_escape_code
    colorcodes = {
        'TRACE': '\033[35m',      # magenta
        'DEBUG': '\033[37m',      # light gray
        'INFO': '\033[94m',       # light blue
        'NOTICE': '',             # default
        'WARNING': '\033[91m',    # light red
        'ERROR': '\033[31;1m'     # yellow (bold)
    }

    level = record.levelname.upper()
    if level in colorcodes:
        return colorcodes[level] + msg + '\033[0m'


def preprend_error_level(msg, record, normalize=True):

    level = record.levelname.upper()
    levels = ['TRACE', 'DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR']

    if level not in levels:
        level = '*****'
    elif level == 'WARNING':
        level = 'WARN'
    elif level == 'NOTICE':
        level = ''

    if normalize is True:
        out = ' ' * 8
        if level != '':
            out = ('[{}]' + out).format(level)[:8]
    else:
        out = '[{}] '.format(level) if level != '' else ''

    return out + msg


def prepend_timestamp(msg, record):

    return strftime('%H:%M:%S', localtime(record.created)) + '.{:0=3d} {}'.format(int(record.msecs), msg)


def prepend_generated_at(msg, record):

    fn = record.filename
    if fn in ['__init__.py']:
        # displaying those filenames is not too supportive
        # thus we add the directory.
        d = os.path.dirname(record.pathname)
        b = os.path.basename(d)
        fn = '{}/{}'.format(b, fn)

    premsg = '{}[{}'.format(fn, record.lineno)
    if record.funcName != '<module>':
        premsg += '|{}'.format(record.funcName)
    premsg += ']: '

    return premsg + msg


class FileFormatter(logging.Formatter):

    def format(self, record):

        # to perform casting to string
        # msg = '{}'.format(record.msg)
        msg = record.getMessage()

        if msg is None or len(msg) < 1:
            return ""

        msg = as_single_line(msg)

        # if DEBUG: prepend special info to message
        lvlname = record.levelname.upper()
        if lvlname in ['DEBUG', 'TRACE']:
            msg = prepend_generated_at(msg, record)

        msg = prepend_timestamp(msg, record)
        msg = preprend_error_level(msg, record)

        return msg


class PyCharmFormatter(FileFormatter):

    def format(self, record):

        msg = FileFormatter.format(self, record)
        msg = colorize(msg, record)
        
        return msg


class ConsoleFormatter(logging.Formatter):

    def format(self, record):

        # to perform casting to string
        # msg = '{}'.format(record.msg)
        msg = record.getMessage()

        if msg is None or len(msg) < 1:
            return ""

        pre_msg = prepend_timestamp("", record)
        pre_msg = preprend_error_level(pre_msg, record)

        # if DEBUG: prepend special info to message
        lvlname = record.levelname.upper()
        if lvlname in ['DEBUG', 'TRACE']:
            msg = prepend_generated_at(msg, record)

        # add propper line breaks for nice output:
        try:
            from terminalsize import get_terminal_size

            # Try to get the size of the terminal
            sx, sy = get_terminal_size()
            # we need space for the Level and the TimeStamp
            sx -= len(pre_msg)

            # only if relevant space left
            if sx > 10:

                # split multiline msg to keep the newline seperators
                lines = msg.splitlines()
                out = []

                # for any line
                for aline in lines:
                    terms = aline.split()
                    terms.reverse() # ... so that we can pop() later

                    # check if term still fits in this line
                    new_line = ''
                    while terms:
                        aterm = terms.pop()
                        lnl = len(new_line)
                        # max length defined by terminal window
                        if sx - lnl > len(aterm):
                            if lnl > 0:
                                new_line += ' '
                            new_line += aterm
                        else:
                            out.append(new_line)
                            # There is one special case here:
                            # If the length of aterm is larger than sx,
                            # it would create an ugly linebreak if output.
                            # Therefore add max the length of the line
                            new_line = aterm[:sx]
                            # if aterm was longer than sx, put the rest back on the stack:
                            if len(aterm) > sx:
                                terms.append(aterm[sx:])

                    out.append(new_line)

                # put it together again!
                msg = ('\r\n' + ' ' * len(pre_msg)).join(out)

            else:
                msg = as_single_line(msg)

        except:
            msg = as_single_line(msg)

        return colorize(pre_msg + msg, record)


class LogFormatter(logging.Formatter):

    def format(self, record):

        # to perform casting to string
        # msg = '{}'.format(record.msg)
        msg = record.getMessage()


        if msg is None or len(msg) < 1:
            return ""

        msg = as_single_line(msg)

        # if DEBUG: prepend special info to message
        lvlname = record.levelname.upper()
        if lvlname in ['DEBUG', 'TRACE']:
            msg = prepend_generated_at(msg, record)

        # msg = prepend_timestamp(msg, record)
        msg = preprend_error_level(msg, record, normalize=False)
        # msg = colorize(msg, record)

        return msg


# Sanitizer - especially to ensure that error messages can be displayed in the client log correctly
def sanitize_for_html(string):
    string = str(string)

    has_starting_space = string[0] == ' '
    has_final_space = string[-1:] == ' '

    # removes all whitespace including new lines:
    string = ' '.join(string.split())

    # Escape HTML special characters ``&<>``, slashes '\/' and quotes ``'"``
    out = string.replace('&', '&amp;').replace("\\", '&#92;').replace("/", '&#47;') \
        .replace('<', '&lt;').replace('>', '&gt;') \
        .replace('"', '&quot;').replace("'", '&#039;')

    if has_starting_space is True:
        out = ' ' + out

    if has_final_space is True:
        out += ' '

    return out


from logging import Filter, _checkLevel


class FileBasedFilter(logging.Filter):

    def __init__(self, name='', level='NOTICE'):

        # This will raise if wrong 'level' used
        self.standard_level = _checkLevel(level)
        self.files = {}

        super(FileBasedFilter, self).__init__(name)

    def setLevel(self, level):
        self.standard_level = _checkLevel(level)

    def set_level_for_file(self, filepath, level):
        self.files[filepath] = _checkLevel(level)

    def remove_level_for_file(self, filepath):
        if filepath in self.files:
            del self.files[filepath]

    def filter(self, record):

        if super(FileBasedFilter, self).filter(record) == 0:
            return 0

        if record.pathname in self.files:
            if record.levelno >= self.files[record.pathname]:
                return 1

        if record.levelno >= self.standard_level:
            return 1

        return 0


__gsbf__ = FileBasedFilter()

def getGlobalFilter():
    return __gsbf__

