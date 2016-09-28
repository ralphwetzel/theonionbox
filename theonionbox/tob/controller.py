from __future__ import absolute_import
from stem.control import Controller
from tob.tob_time import getTimer

from stem.socket import ControlPort
import stem
import socket

import logging
import datetime
import sys

#####
# Python version detection
py = sys.version_info
py27 = py >= (2, 7, 0)
py33 = py >= (3, 3, 0)

class tobControlPort(ControlPort):

    timeout = None
    control_socket = None

    def __init__(self, address='127.0.0.1', port=9051, connect=True, timeout=None):

        self.timeout = timeout
        ControlPort.__init__(self, address, port, connect)

    # this is basically stem.socket.ControlPort._make_socket adapted to set a custom timeout value
    def _make_socket(self):

        if self.control_socket:
            self.close_socket()

        try:
            self.control_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        except socket.error as exc:
            raise stem.SocketError(exc)

        try:
            # timeout management
            if self.timeout:
                self.control_socket.settimeout(self.timeout)
                pass

            self.control_socket.connect((self._control_addr, self._control_port))
            return self.control_socket
        except socket.error as exc:

            # to compensate for a ResourceWarning 'unclosed socket'
            self.close_socket()
            raise stem.SocketError(exc)

    def close_socket(self):
        if self.control_socket:
            self.control_socket.close()
            self.control_socket = None


class tobController(Controller):

    timestamp = 0   # Timestamp when the cache was refreshed the last time
    info_keys = []  # List of keys to refresh get_info from Tor. List grows based on cache misses in _get_cache_map.

    utc_compensation = 0    # offset (in seconds) to correct datetime values coming from stem

    @staticmethod
    def from_port_timeout(address='127.0.0.1', port=9051, timeout=None):
        # this one is basically stem.Controller.from_port patched
        # to forward a timeout value to BoxControlPort

        if not stem.util.connection.is_valid_ipv4_address(address):
            raise ValueError('Invalid IP address: %s' % address)
        elif not stem.util.connection.is_valid_port(port):
            raise ValueError('Invalid port: %s' % port)

        # timeout management
        if timeout and timeout < 0:
            timeout = None

        control_port = tobControlPort(address=address, port=port, timeout=timeout)
        return tobController(control_port)

    def __init__(self, control_socket, is_authenticated=False):
        Controller.__init__(self, control_socket, is_authenticated)
        self.set_caching(True)  # this might be redundant yet ensures that we don't rely on a setting made in stem
        self.timestamp = 0

        # Based on Yoriz comment @
        # http://stackoverflow.com/questions/28089558/alternative-to-total-seconds-in-python-2-6/28089673#28089673
        from datetime import datetime
        td = datetime.now() - datetime.utcnow()
        if py27:
            self.utc_compensation = int(round(td.total_seconds()))
        else:   # python 2.6 and below
            self.utc_compensation = int(round(td.microseconds + 0.0 +
                                              (td.seconds + td.days * 24 * 3600) * 10 ** 6) / 10 ** 6)

    def authenticate_password(self, *args, **kwargs):
        """
        A convenience method to authenticate the controller. This is just a
        pass-through to :func:`stem.connection.authenticate_password`.
        """

        import stem.connection
        stem.connection.authenticate_password(self, *args, **kwargs)

    def refresh(self):
        boxLog = logging.getLogger('theonionbox')
        boxLog.debug('Controller: Refreshing GET_INFO cache...')

        self.set_caching(False)
        if self.info_keys:
            self.get_info(self.info_keys)
        # If get_info raises an exception the next lines will not be executed.
        # This is intended!
        self.set_caching(True)
        self.timestamp = getTimer().time()

    def get_timestamp(self):
        return self.timestamp

    def _get_cache_map(self, params, namespace=None):
        """
        Queries our request cache for multiple entries.

        :param list params: keys to be queried
        :param str namespace: namespace in which to check for the keys

        :returns: **dict** of 'param => cached value' pairs of keys present in cache
        """

        retval = Controller._get_cache_map(self, params, namespace)

        if namespace == 'getinfo':
            if len(params) != len(retval):
                boxLog = logging.getLogger('theonionbox')

                for key in retval:
                    params.remove(key)

                for key in params:
                    # boxLog.notice("Controller: Cache miss for GETINFO parameter '{}'.".format(key))
                    if key not in self.info_keys:
                        boxLog.debug("Controller: Parameter '{}' added to Refresh procedure.".format(key))
                        self.info_keys.append(key)

        return retval

    def get_version_short(self):
        """
        get_version_short()

        A convenience method to get tor version in format major.minor.micro.patch
        that current controller is connected to.

        :returns: :str: string of the tor instance that we're connected to

        :raises:
          * :class:`stem.ControllerError` if unable to query the version
          * **ValueError** if unable to parse the version

        """

        version_short = self._get_cache('version|short')

        if not version_short:
            v = self.get_version()
            version_short = '{}.{}.{}.{}'.format(v.major, v.minor, v.micro, v.patch) if v else ''
            self._set_cache({'version|short': version_short})

        return version_short

    def get_version_current(self):

        current = self._get_cache('version|current')
        if not current:
            current = self.get_info('status/version/current', 'unknown')
            self._set_cache({'version|current': current})

        return current

    def get_flags(self):

        flags = self._get_cache('flags')
        if not flags:
            fp = self.get_fingerprint()
            flags = ['unknown']
            if fp:
                # There's some ugly behaviour in GETINFO("ns/id/...")
                # see https://trac.torproject.org/projects/tor/ticket/7646
                # and https://trac.torproject.org/projects/tor/ticket/7059
                # This behaviour seems to be uncoverable!
                try:
                    result = self.get_info('ns/id/{}'.format(fp))
                except stem.InvalidArguments as exc:
                    # An exception is created and raised here by stem if the network doesn't know us.
                    # It happens if the network thinks we're not running (which might be obvious)
                    # and as well IF WE'RE IN HIBERNATION (which might not be so obvious)!
                    pass
                else:
                    flags = []
                    result = result.split('\n')
                    for line in result:
                        if line.startswith("s "):
                            flags.extend(line[2:].split())

                    # we only cache if there's a valid value
                    # this ensures rechecking every time this value is queried - until we have a valid value
                    self._set_cache({'flags': flags})

        return flags

    def get_fingerprint(self):

        return self.get_info('fingerprint', '')

    def get_address(self):
        return self.get_info('address', '')

    def get_nickname(self):
        return self.get_conf('Nickname', '')

    def get_contactInfo(self):
        return self.get_conf('ContactInfo', '')

    def get_controlSocket(self):
        return self.get_conf('ControlSocket', '')

    def get_hashedControlPassword(self):
        return self.get_conf('HashedControlPassword', None)

    def get_isAuthPassword(self):
        return self.get_hashedControlPassword() is not None

    def get_cookieAuthentication(self):
        return self.get_conf('CookieAuthentication', '0')

    def get_cookieAuthFile(self):
        return self.get_conf('CookieAuthFile', '')

    def get_isAuthCookie(self):
        print(self.get_cookieAuthentication())
        return self.get_cookieAuthentication() == '1'

    # the following functions return a **list** of **(address, port)** tuples for the available listeners
    def get_orPorts(self):
        return self.get_listeners('OR', '')

    def get_dirPorts(self):
        return self.get_listeners('DIR', '')

    def get_controlPorts(self):
        return self.get_listeners('CONTROL', '')

    # accounting
    def get_isAccountingEnabled(self):
        iae = self._get_cache('accounting|enabled')
        if not iae:
            iae = self.get_info('accounting/enabled', '0') == '1'
            self._set_cache({'accounting|enabled': iae})

        return iae

    def get_accountingStats(self):
        acc_stats = self._get_cache('accounting|stats')
        if acc_stats is None:
            asts = None
            ie = None
            try:
                asts = self.get_accounting_stats()
                ie = self.get_info('accounting/interval-end')
            except:
                pass

            if asts:
                # interval_end returns the UTC time yet without any indication that it's UTC.
                # As soon as this datetime is processed, it will be interpreted as local time ...
                # ... WHICH IS WRONG! Therefore we have to fix this!
                # Further comment: We could add a valid tzinfo, yet this depends on pytz or py>3.2 -> manual hack!

                # http://stackoverflow.com/questions/8160246/datetime-to-unix-timestamp-with-millisecond-precision
                # JF Sebastian
                if py33:
                    asts_ie = asts.interval_end.timestamp()  # Python 3.3+
                else:
                    from time import mktime
                    asts_ie = mktime(asts.interval_end.timetuple()) + asts.interval_end.microsecond / 1e6  # Python 2.7

                acc_stats = {
                    'retrieved': asts.retrieved,
                    'status': asts.status,
                    'interval_end': asts_ie + self.utc_compensation,
                    'time_to_reset': '{}'.format(datetime.timedelta(seconds=asts.time_until_reset)),
                    'read_bytes': asts.read_bytes,
                    'read_bytes_left': asts.read_bytes_left,
                    'read_limit': asts.read_limit,
                    'written_bytes': asts.written_bytes,
                    'write_bytes_left': asts.write_bytes_left,
                    'write_limit': asts.write_limit,
                }

                self._set_cache({'accounting|stats': acc_stats})

        return acc_stats

