# from configuration import BaseNodeConfig
from typing import Optional, Union
from stam.control import Controller, EventType
# from .worker import Worker
from persistor import Storage, BandwidthPersistor
import stem.response
import logging
from tob.log import LoggingManager, ForwardHandler
from tob.scheduler import Scheduler, SchedulerNotRunningError
import livedata
from time import time, strftime
import functools
from tob.proxy import Proxy as TorProxy

from tob.onionoo import getOnionoo, OnionooData

import tob.transportation
import contextlib

from tob.config import DefaultNodeConfig
from tob.ccfile import CCNode
import uuid

#   Node
#   - Config
#   - TorController
#   - TorLogManager
#   - BandwidthRecorder -> Storage
#   - Clients
#   - Cron


class AlreadyRegisteredError(IndexError):
    pass


class NotConnectedError(ConnectionError):
    pass


class Node(object):
    
    def __init__(self, config: Union[DefaultNodeConfig, CCNode], database: Storage, id: Optional[str] = None):

        # assign or create individual id
        self._id = id or uuid.uuid4().hex

        self._config = config

        self._tor = None
        self._log = LoggingManager(notice=True, warn=True, err=True)
        self._clients = []
        self._bandwidth = None
        self._database = database
        self._onionoo = None
        self.proxy = None

        self._cron = Scheduler()
        self._cron.start()

        # Launch regular update of cumulated Bandwidth information
        self._last_bw_event = None
        self.refresh_bandwidth()

        # self.password = None

        self.connections = tob.transportation.Connections()
        self.circuits = tob.transportation.Circuits()
        self.streams = tob.transportation.Streams()

        self._label = None

        # This job runs at midnight to add a notification to the log
        # showing the current day
        def job_NewDayNotification():
            self._log.notice(f"----- Today is {strftime('%A, %Y-%m-%d')}. -----")

        self._cron.add_job(job_NewDayNotification, 'cron', id='ndn', hour='0', minute='0', second='0')

    @property
    def id(self) -> str:
        return self._id

    @property
    def config(self) -> Union[DefaultNodeConfig, CCNode]:
        return self._config

    @property
    def controller(self) -> Controller:
        if self._tor is None:
            raise ConnectionError("{}: Tor controller not created.".format(self.config.label))
        return self._tor

    # def client_register(self, id):
    #
    #     if self._tor is None:
    #         raise NotConnectedError("Cannot register ID {}. Node is not connected.".format(id))
    #
    #     if id in self._clients:
    #         raise AlreadyRegisteredError("ID {} already registered.".format(id))
    #
    #     self._clients.append(id)
    #     if self._log is not None:
    #         self._log.add_client(id)
    #
    # def client_remove(self, id):
    #
    #     try:
    #         self._clients.remove(id)
    #     except ValueError:
    #         raise IndexError("ID {} not registered.", format(id))
    #
    #     if self._log is not None:
    #         self._log.remove_client(id)

    def connect(self, proxy: Optional[TorProxy] = None):

        # print(f'{self._id}: #1 -> {time()}')
        if proxy is not None:
            self.proxy = proxy

        if self._tor is None:
            self._tor = Controller.from_config(self._config, proxy=proxy, timeout=30)

            # print(f'{self._id}: #2 -> {time()}')

            # As soon as the controller is authenticated, we collect the latest BW data and initialize the LiveData
            self._tor.register_post_auth_callback(self.post_auth)

            # print(f'{self._id}: #3 -> {time()}')

        self.refresh_bandwidth()

        # print(f'{self._id}: #4 -> {time()}')

    def disconnect(self):
        if self._tor is not None:
            self._tor.close()
            self._tor = None

    def post_auth(self):

        self._log.connect(self._tor)

        self._init_bandwidth_transmission()
        self._init_transportation_monitoring()

        fp = None
        try:
            fp = self._tor.fingerprint
        except:
            return

        if fp is not None and len(fp) > 0:
            OM = getOnionoo()
            self._onionoo = OM.register(fp)

    def shutdown(self):
        log = logging.getLogger('theonionbox')
        log.debug("Shutting down controller to '{}'...".format(self._id))

        if self._bandwidth is not None:
            self._bandwidth.shutdown()

        self.disconnect()

        # if self._onionoo is not None:
        #     self._onionoo.shutdown()

        if self._cron is not None:
            try:
                self._cron.shutdown()
            except SchedulerNotRunningError:
                pass
            self._cron = None

        # to prevent in situ mod of the list
        # l = len(self._clients)
        # while l > 0:
        #     try:
        #         self.client_remove(self._clients[0])
        #     except:
        #         del self._clients[0]
        #     l -= 1
        #
        # self._clients = None

    @property
    def logs(self) -> LoggingManager:
        return self._log

    @property
    def bandwidth(self) -> livedata.Manager:
        return self._bandwidth

    @property
    def onionoo(self) -> Optional[OnionooData]:
        # assert(self._onionoo is not None)
        return self._onionoo

    def refresh_bandwidth(self):
        tr = None
        tw = None

        if self._tor is not None:

            try:
                if self._tor.is_authenticated() is True:
                    bw = self._tor.get_info(['traffic/read', 'traffic/written'], default=[None, None])
                    tr = int(bw['traffic/read'])
                    tw = int(bw['traffic/written'])
                    # print(tr, tw)
            except DeprecationWarning as dw:
                log = logging.getLogger('theonionbox')
                log.debug('Deprecation Warning: {}'.format(dw))
                # print(dw)
            except Exception as exc:
                log = logging.getLogger('theonionbox')
                log.debug(exc)
                # print(bw)
            else:
                if tr is not None and tw is not None:
                    self._bandwidth.set_traffic(int(tr), int(tw))

        if self._cron.get_job('bw') is None:
            self._cron.add_job(self.refresh_bandwidth, 'interval', id='bw', minutes=1)

    def _init_bandwidth_transmission(self):

        # From control-spec.txt:
        # "bw-event-cache"
        # A space-separated summary of recent BW events in chronological order
        # from oldest to newest.  Each event is represented by a comma-separated
        # tuple of "R,W", R is the number of bytes read, and W is the number of
        # bytes written.  These entries each represent about one second's worth
        # of traffic.

        # for desc in self.tor.get_network_statuses():
        #     print(desc.fingerprint)

        if self._bandwidth is None:

            log = logging.getLogger('theonionbox')
            log.debug('Initializing Bandwidth transmission handling...')

            fp = self._tor.fingerprint
            pers = BandwidthPersistor(storage=self._database, fingerprint=fp)

            self._bandwidth = livedata.Manager(persistor=pers)

            # The Persistor connection
            # It will be generated at the first call to record_bandwidth
            # ... and then reused!
            conn = None

            try:
                bwevc = self._tor.get_info('bw-event-cache').split(' ')
            except Exception as e:
                log.warning('Failed to get cached bandwidth data from Tor. Recently started the node?')
            else:
                bwevc_len = len(bwevc)
                # print("bwevc_len: {}".format(bwevc_len))
                its_now = time()
                counter = 0

                for ev in bwevc:
                    if len(ev) > 0:
                        read, written = ev.split(',')
                        # print('{} == t: {} | r: {} | w: {}'.format(self.id, its_now - bwevc_len + counter, read, written))
                        conn = self._bandwidth.record_bandwidth(time_stamp=its_now - bwevc_len + counter,
                                                                bytes_read=int(read),
                                                                bytes_written=int(written),
                                                                connection=conn)
                        counter += 1

            if conn is not None:
                conn.commit()
                conn.close()

            # start the event handler for the Bandwidth data
            self._tor.add_event_listener(functools.partial(self._handle_bandwidth_transmission), EventType.BW)

    def _handle_bandwidth_transmission(self, event: stem.response.events.BandwidthEvent):

        # now manage the bandwidth data
        if event is None or self._bandwidth is None:
            return

        # According to tor/src/feature/control/control_events.c
        # the BandwidthEvent transmits "[...] the total number of bytes read
        # and written by Tor since the last call to this function."
        # Thus the first event forwards a cumulated value that (usually) represents more than just the
        # bandwidth volume of this last second. Therefore we swallow this value...

        # print("{} == {} / {}".format(self.id, self._last_bw_event, event))

        if self._last_bw_event is not None:
            conn = self._bandwidth.record_bandwidth(time_stamp=event.arrived_at,
                                                    bytes_read=int(event.read),
                                                    bytes_written=int(event.written))

            if conn is not None:
                conn.commit()
                conn.close()

        # print(event)
        self._last_bw_event = event

        return

    def _init_transportation_monitoring(self):
        self._rebase_transportation_status()
        # self.print_transportation_status()
        self._tor.add_event_listener(functools.partial(self._handle_orconn_event), EventType.ORCONN)
        self._tor.add_event_listener(functools.partial(self._handle_stream_event), EventType.STREAM)
        self._tor.add_event_listener(functools.partial(self._handle_circuit_event), EventType.CIRC)

    def _rebase_transportation_status(self):

        with contextlib.suppress(Exception):
            self.streams.rebase(self._tor.get_info('stream-status'))
            self.circuits.rebase(self._tor.get_info('circuit-status'))
            self.connections.rebase(self._tor.get_info('orconn-status'))

        if self._cron.get_job('transport') is None:
            self._cron.add_job(self._rebase_transportation_status, 'interval', id='transport', minutes=5)

    def _handle_orconn_event(self, event: stem.response.events.ORConnEvent):
        self.connections.push(event)
        # print('{} ORConn: {}'.format(self.id, self.orconn.process(event)))

    def _handle_stream_event(self, event: stem.response.events.StreamEvent):
        self.streams.push(event)
        # print('{} Stream: {}'.format(self.id, self.stream.process(event)))

    def _handle_circuit_event(self, event: stem.response.events.CircuitEvent):
        self.circuits.push(event)
        # print('{} CIRC: {}'.format(self.id, self.circ.process(event)))

    def print_transportation_status(self):

        print('{} -> Connections: {} | Circuits: {} | Streams: {}'.format(self.id, self.connections.count,
                                                                          self.circuits.count, self.streams.count))

        if self._cron.get_job('transport_print') is None:
            self._cron.add_job(self.print_transportation_status, 'interval', id='transport_print', seconds=5)

    @property
    def label(self):

        lbl = None
        # try to get the label from the config file
        with contextlib.suppress(KeyError):
            lbl = self.config.label

        # ... and if there's no label, we try to guess if it's a client running...
        # Attention: This checks - by reason - only local connections.
        # Remote connections have to be established for checking - and if connected, the nickname should be retrievable!
        if lbl in [None, ""]:
            with contextlib.suppress(Exception):
                p = self.controller.get_ports('CONTROL')
                if 9151 in p:
                    lbl = 'TorBrowser'
                elif 9051 in p:
                    lbl = 'Tor'

        if lbl is None:
            lbl = 'Remote TorNode' # *sigh*

        return lbl

    @property
    def nickname(self) -> Optional[str]:

        nick = None
        with contextlib.suppress(ConnectionError):
            if self.controller.is_authenticated():
                nick = self.controller.nickname

        # if there's no nickname, try to get at least the label
        if nick in [None, '']:
            nick = self.label

        return nick