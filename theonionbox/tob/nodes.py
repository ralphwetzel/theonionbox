import logging
from log import LoggingManager
from livedata import LiveDataManager
from scheduler import Scheduler
from controller import Controller
from stem import SocketError
from stem.control import EventType
import functools
from time import time

# There is a deprecation warning in stem's @with_defaults decorater
# that we try to catch with this setup
# import warnings
# warnings.filterwarnings("error")


class TorNode(object):
    tor = None      # controller
    torLog = None
    boxLog = None
    torLogMgr = None

    livedata = None     # Live Bandwidth data
    bwdata = {}         # cumulated Bandwidth information

    cron = None
    password = None

    # sections = None
    
    id = None

    def __init__(self, controller, livedata=None, notice=True, warn=True, err=True):
        self.tor = controller


        self.cron = Scheduler()
        self.cron.start()

        # this will manage all MessageHandlers to receive Tor's events
        ### it will be instantiated later as soon as we've a contact to the Tor process
        self.torLogMgr = LoggingManager(controller, notice=notice, warn=warn, err=err)

        # This is the logger for Tor related messages.
        # The clients will get their messages from this logger.
        self.torLog = logging.getLogger(self.torLogMgr.get_logger_name())
        self.torLog.setLevel('DEBUG')
        self.torLog.addHandler(logging.NullHandler())

        self.boxLog = logging.getLogger('theonionbox')

        if livedata is None:
            # we need a new LiveDataHandler
            self.livedata = LiveDataManager()
            # as soon as the controller is authenticated, we collect the latest BW data and initialize the LiveData
            self.tor.register_post_auth_callback(self._init_livedata)
        else:
            # We reuse the provided LiveData
            self.livedata = livedata

        # start the event handler for the Bandwidth data
        self.tor.add_event_listener(functools.partial(self._handle_livedata), EventType.BW)

        self.bwdata = {'upload': 0, 'download': 0, 'limit': 0, 'burst': 0, 'measure': 0}
        self.refresh_bw()

#        self.cron.add_job(self._update_tor_info, 'interval', minutes=1, args=[self])
        self.cron.add_job(self._update_tor_info, 'interval', minutes=1)

    def __del__(self):
        self.shutdown()

    def shutdown(self):
        if self.tor is not None:
            self.tor.close()
        if self.cron is not None:
            self.cron.shutdown()

    @property
    def logging_level(self, level):
        self.torLog.setLevel(level)

    @property
    def logging_level(self):
        return self.torLog.getEffectiveLevel()

    def refresh_bw(self):
        tr = None
        tw = None

        try:
            if self.tor.is_authenticated() is True:
                bw = self.tor.get_info(['traffic/read', 'traffic/written'], default=[None, None])
                tr = int(bw['traffic/read'])
                tw = int(bw['traffic/written'])
                # print(tr, tw)
        except DeprecationWarning as dw:
            self.boxLog.debug('Deprecation Warning: {}'.format(dw))
            # print(dw)
        except Exception as exc:
            self.boxLog.debug(exc)
        else:
            if tr is not None and tw is not None:
                self.livedata.set_traffic(int(tr), int(tw))
        finally:
            if self.cron.get_job('bw') is not None:
                return
            self.cron.add_job(self.refresh_bw, 'interval', id='bw', minutes=5)

    def _handle_livedata(self, event):
        if event is None:
            return False

        # print(self, event)

        # now manage the bandwidth data
        self.livedata.record_bandwidth(time_stamp=event.arrived_at
                                      , bytes_read=event.read
                                      , bytes_written=event.written)
        return True

    def _init_livedata(self):

        # From control-spec.txt:
        # "bw-event-cache"
        # A space-separated summary of recent BW events in chronological order
        # from oldest to newest.  Each event is represented by a comma-separated
        # tuple of "R,W", R is the number of bytes read, and W is the number of
        # bytes written.  These entries each represent about one second's worth
        # of traffic.

        log = logging.getLogger('theonionbox')
        log.debug('Initializing LiveData transmission...')

        try:
            bwevc = self.tor.get_info('bw-event-cache').split(' ')
            bwevc_len = len(bwevc)
            its_now = time()
            counter = 0
            for ev in bwevc:
                read, written = ev.split(',')
                self.livedata.record_bandwidth(time_stamp=its_now - bwevc_len + counter
                                               , bytes_read=int(read)
                                               , bytes_written=int(written))
                counter += 1
        except Exception as e:
            log.warning('Failed to erstablish LiveData connection: {}'.format(e))
            pass


    # this will be called by a cron job each minute once!
    def _update_tor_info(self, params=None):

        if self.tor.is_authenticated() is False:
            return

        try:
            self.tor.refresh(params)
        except:
            pass

#    def get_protocolinfo(self):
#        return self.tor.get_protocolinfo()

#    def authenticate(self, password=None, protocolinfo_response=None):
#        return self.tor.authenticate(password=password, protocolinfo_response=protocolinfo_response)

    # def tor(self):
    #     return self.tor
    #
    #
    #
    #
    # def __getattr__(self, item):
    #
    #     try:
    #         func = getattr(self.tor, item)
    #     except:
    #         raise NotImplementedError
    #
    #     return func

    # def __setattr__(self, key, value):

    def authenticate(self, *args, **kwargs):
        return self.tor.authenticate(*args, **kwargs)

    def authenticate_with_password(self, password):

        log = logging.getLogger('theonionbox')
        log.debug('tor.is_alive(): {}'.format(self.tor.is_alive()))

        # check if there is a connection to TOR
        if not self.tor.is_alive():
            try:
                self.tor.connect()
            except:
                return False
            log.debug('tor.is_alive() after connect(): {}'.format(self.tor.is_alive()))

        # global tor_password

        log.debug('tor.is_authenticated(): {}'.format(self.tor.is_authenticated()))
        if self.tor.is_authenticated():

            # update_tor_info(GETINFO_ITEMS_USED_BY_THE_BOX)

            return password == self.password
        else:
            retval = False
            try:
                self.tor.authenticate(password=password)
                self.password = password
                retval = True

                # update_tor_info(GETINFO_ITEMS_USED_BY_THE_BOX)

            except Exception as exc:
                log.debug('tor.authenticated() raised: {}'.format(exc))
            finally:
                log.debug('tor.is_authenticated() after authenticate_password(): {}'.format(self.tor.is_authenticated()))

            return retval


class RelayNode(TorNode):

    def __init__(self, controller, livedata=None, notice=True, warn=True, err=True):
        super(RelayNode, self).__init__(controller, livedata, notice, warn, err)


class BridgeNode(TorNode):

    def __init__(self, controller, livedata=None, notice=True, warn=True, err=True):
        super(BridgeNode, self).__init__(controller, livedata, notice, warn, err)


class ClientNode(TorNode):

    def __init__(self, controller, livedata=None, notice=True, warn=True, err=True):
        super(ClientNode, self).__init__(controller, livedata, notice, warn, err)

class NodesFactory(object):

    def __init__(self, timeout=5):
        self.nodes = {}
        self.timeout = timeout
        self.logger = logging.getLogger('theonionbox')

    def __del__(self):
        self.shutdown()

    def shutdown(self):
        for node in self.nodes.items():
            node.shutdown()

    def from_port(self, host, port):
        try:
            contrl = Controller.from_port_timeout(host, port, self.timeout)
        except SocketError as err:
            self.logger.warning('Failed to connect: {}'.format(err))
            raise err

        node = RelayNode(contrl)
