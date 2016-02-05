# from stem.control import EventType
from datetime import datetime
from time import time
from collections import deque
import itertools
import uuid
# from tob_time import TimeManager


class EventsManager(object):

    # The standard flags for the messages "to be preserved"
    # Those are messages intended to be delivered to a client when
    # he connects to TOB ... to show him a history of relevant information
    preserve_ERR = True
    preserve_WARN = True
    preserve_NOTICE = True

    # a dict of {client_id: client_dict}:
    # each client_dict stores for one client:
    # 'count': Number of events 'subscribed' to
    # 'events': The events received so far
    events_of_client = {}

    # a dict to store the client id's for the events of the different runlevels
    clients_for_runlvl = {
        'DEBUG': [],
        'INFO': [],
        'NOTICE': [],
        'WARN': [],
        'ERR': [],
        'BOX|DEBUG': [],
        'BOX|INFO': [],
        'BOX|NOTICE': [],       # this is the default OnionBox runlevel; will become 'BOX' in the client application
        'BOX|WARN': [],         # clients will automatically be subscribed to 'BOX|NOTICE', 'BOX|WARN', 'BOX|ERROR'
        'BOX|ERR': []
        }

    # This is the client-ID we use to store the messages of the
    # events "to be preserved"
    self_id = None

    # used to compensate for clock deviations
    _time = None

    def __init__(self, time_manager, preserve_err=preserve_ERR,
                 preserve_warn=preserve_WARN, preserve_notice=preserve_NOTICE):

        from stem.control import EventType

        self.self_id = str(uuid.uuid4())
        self._time = time_manager

        if preserve_err is True:
            self.add_client(self.self_id, EventType.ERR)
            # self.add_client(self.self_id, EventType.ERR)

        if preserve_warn is True:
            self.add_client(self.self_id, EventType.WARN)
            # self.add_client(self.self_id, EventType.WARN)

        if preserve_notice is True:
            self.add_client(self.self_id, EventType.NOTICE)
            # self.add_client(self.self_id, EventType.NOTICE)


        # client_id == 'TheOnionBox' is used for console output
        self.add_client('TheOnionBox', 'BOX|WARN')
        self.add_client('TheOnionBox', 'BOX|ERR')

    def debug(self, message, compensate_deviation=True):
        self._record_box_event("BOX|DEBUG", message, compensate_deviation)

    def info(self, message, compensate_deviation=True):
        self._record_box_event("BOX|INFO", message, compensate_deviation)

    def log(self, message=None, compensate_deviation=True):
        self._record_box_event("BOX|NOTICE", message, compensate_deviation)

    def warn(self, message=None, compensate_deviation=True):
        self._record_box_event("BOX|WARN", message, compensate_deviation)

    def err(self, message=None, compensate_deviation=True):
        self._record_box_event("BOX|ERR", message, compensate_deviation)

    def _record_box_event(self, runlevel, message, compensate_deviation=True):

        timestamp = time()
        if compensate_deviation is True:
            timestamp = self._time(timestamp)

        ee = {'s': int(timestamp*1000),                # ms for JS!
              'l': runlevel,
              'm': message.rstrip()}

        self._append_event(runlevel, ee)

#        if __debug__:
#            print("[{}] {} {}".format(runlevel, datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S'), message))

    def record_event(self, event, compensate_deviation=True):

        timestamp = event.arrived_at
        if compensate_deviation is True:
            timestamp = self._time(timestamp)

        js_time_stamp = int(timestamp*1000)                # ms for JS!

        e_runlvl = event.runlevel

        # create the event table entry
        ee = {'s': js_time_stamp,
              'l': e_runlvl,
              'm': event.message}

        self._append_event(e_runlvl, ee)

    def _append_event(self, runlevel, event_entry):

        # check if we have clients for this runlevel
        if runlevel in self.clients_for_runlvl:

            # each subscribed client ...
            for client_id in self.clients_for_runlvl[runlevel]:

                # ... gets this event-entry attached
                if client_id in self.events_of_client:

                    if client_id == 'TheOnionBox':

                        # console output
                        runlevel = event_entry['l']
                        if runlevel == 'BOX|NOTICE':
                            runlevel = 'BOX'    # to compact the output as the client script does
                        print("[{}] {} {}"
                              .format(runlevel,
                                      datetime.fromtimestamp(event_entry['s'] / 1000).strftime('%H:%M:%S'),
                                      event_entry['m']))

                    else:
                        event_msgs = self.events_of_client[client_id]['events']
                        event_msgs.appendleft(event_entry)

    def add_client(self, client_id, runlevel, init_preserved_events=True):

        if runlevel in self.clients_for_runlvl:
            runlvl_clients = self.clients_for_runlvl[runlevel]

            if client_id in runlvl_clients:
                return False    # exit here as this client is already registered to receive the given event!
            else:
                runlvl_clients.append(client_id)

                # check if this is the first client appended; returns True to indicate that it
                #  was great to perform an add_event_listener now!
                retval = (len(runlvl_clients) == 1)

            if client_id in self.events_of_client:
                count = self.events_of_client[client_id]['count']
                self.events_of_client[client_id]['count'] = count + 1
            else:

                # Standard init of the dict
                if client_id is self.self_id or init_preserved_events is False:
                    self.events_of_client[client_id] = {'count': 1,
                                        'events': deque(maxlen=1000)}
                else:
                    # if appropriate, we transfer the "preserved_events" to this dict
                    self.events_of_client[client_id] = {'count': 1,
                                                        'events': deque(itertools.islice(
                                                            self.events_of_client[self.self_id]['events'], 1000)
                                                            , maxlen=1000)}

                self.add_client(client_id, 'BOX|NOTICE')
                self.add_client(client_id, 'BOX|WARN')
                self.add_client(client_id, 'BOX|ERROR')

            return retval

    def remove_client(self, client_id, runlevel):

        if runlevel in self.clients_for_runlvl:
            runlvl_clients = self.clients_for_runlvl[runlevel]

            if client_id not in runlvl_clients:
                return False # no need to process anything!
            else:
                runlvl_clients[:] = [client for client in runlvl_clients if not (client == client_id)]

                # check if this is the last client to be removed; returns True to indicate that it
                #  was great to perform an remove_event_listener now!
                retval = (len(runlvl_clients) == 0)

            if client_id in self.events_of_client:
                count = self.events_of_client[client_id]['count']
                if count > 1:
                    self.events_of_client[client_id]['count'] = count - 1
                else:
                    del self.events_of_client[client_id]
                    self.remove_client(client_id, 'BOX|NOTICE')

            return retval

    def kill_client(self, client_id):
        self.remove_client(client_id, 'DEBUG')
        self.remove_client(client_id, 'INFO')
        self.remove_client(client_id, 'NOTICE')
        self.remove_client(client_id, 'WARN')
        self.remove_client(client_id, 'ERR')
        self.remove_client(client_id, 'BOX|DEBUG')
        self.remove_client(client_id, 'BOX|INFO')
        self.remove_client(client_id, 'BOX|WARN')
        self.remove_client(client_id, 'BOX|ERROR')
        # 'BOX|NOTICE' will then be removed automatically!


    def get_active_clients(self, runlevel):

        if runlevel in self.clients_for_runlvl:
            clients = self.clients_for_runlvl[runlevel]
            return len(clients)

        return -1

    def get_events(self, client_id, limit=None):

        if client_id in self.events_of_client:
            retval = list(itertools.islice(self.events_of_client[client_id]['events'], 0, limit))
            self.events_of_client[client_id]['events'].clear()

            return retval

    def get_events_preserved(self, limit=None):

        if self.self_id in self.events_of_client:
            return list(itertools.islice(self.events_of_client[self.self_id]['events'], 0, limit))