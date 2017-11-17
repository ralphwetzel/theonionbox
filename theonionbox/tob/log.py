# from stem.control import EventType

from __future__ import absolute_import

from datetime import datetime
from time import time
from collections import deque
import itertools
import uuid

import logging
from logging.handlers import MemoryHandler, BufferingHandler
import functools
from tob.deviation import getTimer
import sys

from threading import RLock


from json import dumps

# level_tor_to_box = {'DEBUG': 'DEBUG',
#                     'INFO': 'INFO',
#                     'NOTICE': 'NOTICE',
#                     'WARN': 'WARNING',
#                     'ERR': 'ERROR'}

level_box_to_tor = {'DEBUG': logging.DEBUG,
                    'INFO': logging.INFO,
                    'NOTICE': 25,
                    'WARN': logging.WARNING,
                    'ERR': logging.ERROR}

py = sys.version_info
py32 = py >= (3, 2, 0)
py34 = py >= (3, 4, 0)
py342 = py >= (3, 4, 2)


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
            if session_id in sfl:

                # remove session_id from list
                self.sessions_for_level[level][:] = [session for session in sfl if not (session == session_id)]
                return len(self.sessions_for_level[level]) == 0

            # else:
            return False

    class _EventHandler(logging.Handler):

        # Custom Handler with integrated Filter according to Tor's Event system

        # the buffer (deque) to keep the events
        buffer = None

        # a dict of runlevel names (e.g. 'DEBUG') used to filter the incoming LogRecords
        levels = None

        # Flag to decide if the buffer should be cleared when flush() is called
        clear_at_flush = True

        # The Lock to guard the buffer
        buffer_lock = None

        def __init__(self, capacity=400, clear_at_flush=True):

            logging.Handler.__init__(self)
            self.buffer = deque(maxlen=capacity)
            self.buffer_lock = RLock()

            self.levels = {}

            if py32:
                self.addFilter(self._filter)
            else:
                self.addFilter(FilterCallback(self._filter))

            self.clear_at_flush = clear_at_flush

        def switch(self, level, status=True):
            # set the information for filtering
            self.levels[level] = status

        def _filter(self, record):
            level = record.levelname
            return self.levels[level] if level in self.levels else False

        def emit(self, record):
            self.buffer_lock.acquire()
            self.buffer.append(record)
            self.buffer_lock.release()

        def flush(self, limit=None, encode=None):

            retval = []
            self.buffer_lock.acquire()

            for record in self.buffer:
                try:
                    msg = str(record.msg).strip()
                    if encode is not None:
                        msg = encode(msg)

                    evnt = {'s': record.source_time,
                            'l': record.levelname[0],
                            'm': msg,
                            't': record.source[0]}
                    retval.append(evnt)
                except:
                    pass

            if self.clear_at_flush:
                    self.buffer.clear()

            self.buffer_lock.release()
            return retval

        def flush_to_target(self, target, limit=None):

            count = 0
            self.buffer_lock.acquire()
            for msg in self.buffer:
                target.emit(msg)
                count += 1
                if limit and count > limit:
                    break

            if self.clear_at_flush:
                self.buffer.clear()

            self.buffer_lock.release()

    tor = None
    logger_name = None   # name of the logger of this node
    monitor = None
    clients = {}

    # This is the client-ID we use to store the messages of the
    # events "to be preserved"
    self_id = None
    preserved_handler = None

    # the levels and their default value
    levels = {'DEBUG': False, 'INFO': False, 'NOTICE': True, 'WARNING': True, 'ERROR': True, 'BOX': True}

    def __init__(self, controller, notice=True, warn=True, err=True):

        lgr = logging.getLogger('theonionbox')  # logging messages back to the box

        self.self_id = str(uuid.uuid4().hex)
        lgr.debug('LoggingManager created with id {}.'.format(self.self_id))

        self.logger_name = '{}@theonionbox'.format(self.self_id)

        self.tor = controller
        self.clients = {}

        self.monitor = self._EventSwitchMonitor()

        # This is necessary to ensure a different object for each runlevel
        torLog = logging.getLogger(self.logger_name)
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

    def add_client(self, session_id, capacity=400, clear_at_flush=True):

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
        for level in self.levels:
            self.switch(session_id, level, self.levels[level])

        # now fill it with the preserved messages
        if session_id is not self.self_id:
            preserved_msgs = self.clients[self.self_id]
            preserved_msgs.flush_to_target(mh)

    def remove_client(self, session_id):

        # I know, this is a hack...
        # ... yet it's better than to duplicate the code!
        if session_id == 'shutdown':
            try:
                session_id, mh = self.clients.popitem()
                # print('Shutdown: Removing Client ID {}.'.format(session_id))
            except Exception:
                return False
        else:
            # check if we know this id
            if session_id not in self.clients:
                return False
            # get the MessageHandler
            mh = self.clients[session_id]

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

        if self.tor is None:
            return False

        lgr = logging.getLogger('theonionbox')
        lgr.debug('Switching {} | {} | {}'. format(session_id, level, status))

        # check if we know this id
        if session_id not in self.clients:
            return

        # get the MessageHandler
        mh = self.clients[session_id]
        # and switch the filter accordingly!
        mh.switch(level, status)

        # switch the monitor; if the monitor returns 'True'...
        if self.monitor.switch(session_id, level, status) is True:

            # check if we have an event_handler for this, then ...
            if level in self.event_handlers:

                handler = self.event_handlers[level]

                # ... add or remove the event_listener
                if status is True:

                    # translate to Tor's events
                    if level == 'WARNING':
                        tor_level = 'WARN'
                    elif level == 'ERROR':
                        tor_level = 'ERR'
                    else:
                        tor_level = level

                    lgr.debug("Adding event_listener for Tor's runlevel '{}': {}".format(tor_level, self.event_handlers[level]))
                    self.tor.add_event_listener(self.event_handlers[level], tor_level)
                if status is False:
                    lgr.debug("Removing event_listener for runlevel '{}': {}".format(level, self.event_handlers[level]))
                    self.tor.remove_event_listener(self.event_handlers[level])

    def shutdown(self):
        loop = True
        while loop:
            loop = self.remove_client('shutdown')

    def get_events(self, session_id, encode=None):

        # check if we know this id
        if session_id not in self.clients:
            return None

        # get the MessageHandler
        mh = self.clients[session_id]
        # and return the stored messages!
        return mh.flush(encode=encode)

    def get_logger_name(self):
        return self.logger_name

    def get_id(self):
        return self.self_id


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
        record.msg = record.msg.strip()
        return super(WhitespaceRemovingFormatter, self).format(record)


from time import strftime, mktime, localtime


class ConsoleFormatter(logging.Formatter):

    def __init__(self):
        import os
        # Disable console line breaking when inside the development environment
        self.pycharm = (os.getenv('PYCHARM_RUNNING_TOB', None) == '1')
        super(self.__class__, self).__init__()

    def format(self, record):
        msg = str(record.msg).strip()

        # if DEBUG: prepend special info to message
        lvlname = record.levelname

        if msg != '' and lvlname == 'DEBUG':
            premsg = '{}[{}'.format(record.filename, record.lineno)
            if record.funcName != '<module>':
                premsg += '|{}'.format(record.funcName)
            premsg += ']: '

            msg = premsg + msg

        # only if not in PyCharm
        if self.pycharm is False:

            # add propper line breaks for nice output:
            try:
                from tob.terminalsize import get_terminal_size

                # Try to get the size of the terminal
                sx, sy = get_terminal_size()
                # we need 8 chars for the lvlname
                sx -= 21

                # only if the line is long 'enough'...
                if sx > 10:

                    # split multiline msg to keep the newline seperators
                    lines = msg.splitlines()
                    out = []

                    # for any line
                    for aline in lines:
                        terms = aline.split()

                        # check if term still fitls in this line
                        new_line = ''
                        for aterm in terms:
                            lnl = len(new_line)
                            # max length defined by terminal window
                            if sx - lnl > len(aterm):
                                if lnl > 0:
                                    new_line += ' '
                                new_line += aterm
                            else:
                                out.append(new_line)
                                # There is one special case here:
                                # If the length of aterm is larger then 59,
                                # it will create an ugly linebreak if output.
                                # We accept this to ensure that all data is shown.
                                new_line = aterm

                        out.append(new_line)

                    # put it together again!
                    msg = ('\r\n' + ' ' * 21).join(out)

            except:
                # if it fails: don't care!
                pass

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

            try:
                if record.source != 'box':
                    out += '{} | '.format(record.source)
            except:
                pass

            # if lvlname == 'DEBUG':
            #     out += '{}[{}'.format(record.filename, record.lineno)
            #     if record.funcName != '<module>':
            #         out += '|{}'.format(record.funcName)
            #     out += ']: '

            out += msg

            if lvlname in colorcodes:
                out = colorcodes[lvlname] + out + '\033[0m'

        return out

# 20170409 RDW: Not used?
class ClientFormatter(logging.Formatter):

    def format(self, record):
        msg = str(record.msg).strip()
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


class FileFormatter(logging.Formatter):
    def format(self, record):
        msg = str(record.msg).strip()
        lvlname = record.levelname

        out_lvlname = lvlname
        if lvlname == 'WARNING':
            out_lvlname = 'WARN'
        elif lvlname == 'NOTICE':
            out_lvlname = ''

        out = ' ' * 8
        if out_lvlname != '':
            out = ('[{}]' + out).format(out_lvlname)[:8]

        if msg != '':
            out += strftime('%H:%M:%S', localtime(record.created)) + '.{:0=3d} '.format(int(record.msecs))
            out += msg

        return out
