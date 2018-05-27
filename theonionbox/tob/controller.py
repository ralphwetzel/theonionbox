from __future__ import absolute_import
# from stem.control import Controller, with_default, UNDEFINED, LOG_CACHE_FETCHES, _case_insensitive_lookup
from stem.util import str_type, log
from stem import UNDEFINED

from deviation import getTimer

# from stem.socket import ControlPort, ControlSocketFile
# import stem
import stem.control
import stem.socket
import socket

# import logging
import datetime
import sys
import time

import logging

#####
# Python version detection
py = sys.version_info
py27 = py >= (2, 7, 0)
py33 = py >= (3, 3, 0)

try:
    ConnectionRefusedError
except NameError:
    ConnectionRefusedError = OSError


class BaseController(stem.control.Controller):

    def __init__(self, control_socket, is_authenticated):
        self.callback = None
        super(BaseController, self).__init__(control_socket, is_authenticated)

    def register_post_auth_callback(self, callback):
        self.callback = callback

    def _post_authentication(self):
        log = logging.getLogger('theonionbox')
        log.debug('BaseController._post_authentication()!')

        super(BaseController, self)._post_authentication()

        if self.callback is not None:
            self.callback()


class ControlPort(stem.socket.ControlPort):

    timeout = None
    control_socket = None

    def __init__(self, address='127.0.0.1', port=9051, connect=True, timeout=None):

        self.timeout = timeout
        stem.socket.ControlPort.__init__(self, address, port, connect)

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
            timeout_cache = None
            if self.timeout:
                timeout_cache = self.control_socket.gettimeout()
                self.control_socket.settimeout(self.timeout)

            self.control_socket.connect((self._control_addr, self._control_port))

            if self.timeout:
                self.control_socket.settimeout(timeout_cache)    # reset after successful connection

            return self.control_socket

        except socket.error as exc:

            # to compensate for a ResourceWarning 'unclosed socket'
            self.close_socket()
            raise stem.SocketError(exc)

    def close_socket(self):
        if self.control_socket:
            self.control_socket.close()
            self.control_socket = None


class ControlSocketFile(stem.socket.ControlSocketFile):

    timeout = None
    control_socket = None

    def __init__(self, path='/var/run/tor/control', connect=True, timeout=None):

        self.timeout = timeout
        stem.socket.ControlSocketFile.__init__(self, path, connect)

    # this is basically stem.socket.ControlSocketFile._make_socket adapted to set a custom timeout value
    def _make_socket(self):

        try:
            afunix = socket.AF_UNIX
        except:
            afunix = 1  # should be defined by stem - yet isn't!

        if self.control_socket:
            self.close_socket()

        try:
            self.control_socket = socket.socket(afunix, socket.SOCK_STREAM)
        except socket.error as exc:
            raise stem.SocketError(exc)

        try:
            # timeout management
            timeout_cache = None
            if self.timeout:
                timeout_cache = self.control_socket.gettimeout()
                self.control_socket.settimeout(self.timeout)

            self.control_socket.connect(self._socket_path)

            if self.timeout:
                self.control_socket.settimeout(timeout_cache)    # reset after successful connection

            return self.control_socket

        except socket.error as exc:

            # to compensate for a ResourceWarning 'unclosed socket'
            self.close_socket()
            raise stem.SocketError(exc)

    def close_socket(self):
        if self.control_socket:
            self.control_socket.close()
            self.control_socket = None


class ControlProxy(stem.socket.ControlPort):

    timeout = None
    control_socket = None
    proxy = None

    def __init__(self, address, port=9051, proxy=None, connect=True, timeout=None):

        self.timeout = timeout
        self.proxy = proxy
        stem.socket.ControlPort.__init__(self, address, port, connect)

    # this is basically stem.socket.ControlPort._make_socket adapted to set a custom timeout value
    def _make_socket(self):

        import socks

        if self.control_socket:
            self.close_socket()

        try:
            self.control_socket = socks.socksocket(socket.AF_INET, socket.SOCK_STREAM)
        except socket.error as exc:
            raise stem.SocketError(exc)

        if self.proxy is not None:
            prxy = self.proxy.split(':')
            if len(prxy) == 2:
                self.control_socket.set_proxy(socks.SOCKS5, prxy[0], int(prxy[1]))

        try:
            # timeout management
            timeout_cache = None
            if self.timeout:
                timeout_cache = self.control_socket.gettimeout()
                self.control_socket.settimeout(self.timeout)

            self.control_socket.connect((self._control_addr, self._control_port))

            if self.timeout:
                self.control_socket.settimeout(timeout_cache)    # reset after successful connection

            return self.control_socket

        except socket.error as exc:

            # to compensate for a ResourceWarning 'unclosed socket'
            self.close_socket()
            raise stem.SocketError(exc)

    def close_socket(self):
        if self.control_socket:
            self.control_socket.close()
            self.control_socket = None


class Controller(BaseController):

    timestamp = 0   # Timestamp when the cache was refreshed the last time
    info_keys = []  # List of keys to refresh get_info from Tor. List grows based on cache misses in _get_cache_map.

    utc_compensation = 0    # offset (in seconds) to correct datetime values coming from stem

    @staticmethod
    def from_port_timeout(address='127.0.0.1', port='default', timeout=None):
        # this one is basically stem.Controller.from_port patched
        # to forward a timeout value to BoxControlPort

        # if not stem.util.connection.is_valid_ipv4_address(address):
        #     raise ValueError('Invalid IP address: %s' % address)
        # elif not stem.util.connection.is_valid_port(port):
        #     raise ValueError('Invalid port: %s' % port)

        # timeout management
        if timeout and timeout < 0:
            timeout = None

        if port == 'default':
            try:
                control_socket = ControlPort(address=address, port=9051, timeout=timeout)
                return Controller(control_socket)
            except stem.SocketError as exc:
                try:
                    control_socket = ControlPort(address=address, port=9151, timeout=timeout)
                    return Controller(control_socket)
                except stem.SocketError:
                    raise exc
        else:
            control_socket = ControlPort(address=address, port=int(port), timeout=timeout)
            return Controller(control_socket)

    @staticmethod
    def from_socket_file(path='/var/run/tor/control', timeout=None):
        # this one is basically stem.Controller.from_port patched
        # to forward a timeout value to BoxControlPort

        control_socket = ControlSocketFile(path)
        return Controller(control_socket)

    @staticmethod
    def host_via_proxy(address='127.0.0.1', port=9051, proxy=None, timeout=None):
        control_socket = ControlProxy(address=address, port=port, proxy=proxy, timeout=timeout)
        return Controller(control_socket)

    def __init__(self, control_socket, is_authenticated=False):

        super(Controller, self).__init__(control_socket, is_authenticated)

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

    def refresh(self, params=None):
        boxLog = logging.getLogger('theonionbox')
        # boxLog.debug('Controller: Refreshing GET_INFO cache...')

        keys = []
        if params is None:
            for k in self._request_cache:
                if len(k) > 8 and k[:8] == 'getinfo.':
                    keys.append(k[8:])
        else:
            keys = params

        boxLog.debug('Controller: Refreshing GET_INFO cache @ {}'.format(keys))

        # This is only partially nice
        # ... as we're clearing the whole cache
        # ... and not only the 'getinfo' namespace portion!!
        self.clear_cache()
        if len(keys) > 0:
            self.get_info(keys, cache_miss_warning=False)
        # If get_info raises an exception the next lines will not be executed.
        # This is intended!
        self.timestamp = getTimer().time()

    def get_getinfo_keys(self):

        keys = []
        for k in self._request_cache:
            if len(k) > 8 and k[:8] == 'getinfo.':
                keys.append(k[8:])
        # print(keys)

    def get_timestamp(self):
        return self.timestamp

    # def _get_cache_map(self, params, namespace=None):
    #     """
    #     Queries our request cache for multiple entries.
    #
    #     :param list params: keys to be queried
    #     :param str namespace: namespace in which to check for the keys
    #
    #     :returns: **dict** of 'param => cached value' pairs of keys present in cache
    #     """
    #
    #     if namespace is 'getinfo':
    #         for param in params
    #
    #     retval = Controller._get_cache_map(self, params, namespace)
    #
    #     if namespace == 'getinfo':
    #         if len(params) != len(retval):
    #             boxLog = logging.getLogger('theonionbox')
    #
    #             for key in retval:
    #                 params.remove(key)
    #
    #             for key in params:
    #                 # boxLog.debug("Controller: Cache miss for GETINFO parameter '{}'.".format(key))
    #                 if key not in self.info_keys:
    #                     boxLog.debug("Controller: Parameter '{}' added to Refresh procedure.".format(key))
    #                     self.info_keys.append(key)
    #
    #     return retval

    @stem.control.with_default()
    def get_info(self, params, default=stem.control.UNDEFINED, get_bytes=False, cache_miss_warning=True):
        """
        get_info(params, default = UNDEFINED, get_bytes = False)

        Queries the control socket for the given GETINFO option. If provided a
        default then that's returned if the GETINFO option is undefined or the
        call fails for any reason (error response, control port closed, initiated,
        etc).

        .. versionchanged:: 1.1.0
           Added the get_bytes argument.

        :param str,list params: GETINFO option or options to be queried
        :param object default: response if the query fails
        :param bool get_bytes: provides **bytes** values rather than a **str** under python 3.x
        :param bool cache_miss_warning: Emit a warning if a cache miss happens

        :returns:
          Response depends upon how we were called as follows...

          * **str** with the response if our param was a **str**
          * **dict** with the 'param => response' mapping if our param was a **list**
          * default if one was provided and our call failed

        :raises:
          * :class:`stem.ControllerError` if the call fails and we weren't
            provided a default response
          * :class:`stem.InvalidArguments` if the 'params' requested was
            invalid
          * :class:`stem.ProtocolError` if the geoip database is known to be
            unavailable
        """

        start_time = time.time()
        reply = {}

        if isinstance(params, (bytes, str_type)):
            is_multiple = False
            params = set([params])
        else:
            if not params:
                return {}

            is_multiple = True
            params = set(params)

        # check for cached results

        from_cache = [param.lower() for param in params]
        cached_results = self._get_cache_map(from_cache, 'getinfo')

        for key in cached_results:
            user_expected_key = stem.control._case_insensitive_lookup(params, key)
            reply[user_expected_key] = cached_results[key]
            params.remove(user_expected_key)

        for param in params:
            if param.startswith('ip-to-country/') and self.is_geoip_unavailable():
                # the geoip database already looks to be unavailable - abort the request

                raise stem.ProtocolError('Tor geoip database is unavailable')

        # if everything was cached then short circuit making the query
        if not params:
            if stem.control.LOG_CACHE_FETCHES:
                log.trace('GETINFO %s (cache fetch)' % ' '.join(reply.keys()))

            if is_multiple:
                return reply
            else:
                return list(reply.values())[0]

        if cache_miss_warning is True:
            # As this should only happen when we intentionally refresh the cache (when the warning should be disabled)
            # we warn rather than debug to ensure we get the issue!
            lgr = logging.getLogger('theonionbox')
            lgr.info('Cache miss for the following parameter(s): {}'.format(params))

        try:
            response = self.msg('GETINFO %s' % ' '.join(params))
            stem.response.convert('GETINFO', response)
            response._assert_matches(params)

            # usually we want unicode values under python 3.x

            if stem.prereq.is_python_3() and not get_bytes:
                response.entries = dict((k, stem.util.str_tools._to_unicode(v)) for (k, v) in response.entries.items())

            reply.update(response.entries)

            if self.is_caching_enabled():
                to_cache = {}

                for key, value in response.entries.items():
                    key = key.lower()  # make case insensitive

                    # To allow The Onion Box smooth response cycles even when connecting to a relay / bridge
                    # via Tor socks proxy / hidden service, we cache *all* parameters and 'manually' update them with a
                    # single call every once in a while.

                    to_cache[key] = value
                    if key.startswith('ip-to-country/'):
                        # both cache-able and means that we should reset the geoip failure count
                        self._geoip_failure_count = -1

                self._set_cache(to_cache, 'getinfo')

            log.debug('GETINFO %s (runtime: %0.4f)' % (' '.join(params), time.time() - start_time))

            if is_multiple:
                return reply
            else:
                return list(reply.values())[0]
        except stem.ControllerError as exc:
            # bump geoip failure count if...
            # * we're caching results
            # * this was soley a geoip lookup
            # * we've never had a successful geoip lookup (failure count isn't -1)

            is_geoip_request = len(params) == 1 and list(params)[0].startswith('ip-to-country/')

            if is_geoip_request and self.is_caching_enabled() and self._geoip_failure_count != -1:
                self._geoip_failure_count += 1

                if self.is_geoip_unavailable():
                    log.warn("Tor's geoip database is unavailable.")

            log.debug('GETINFO %s (failed: %s)' % (' '.join(params), exc))

            raise

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

        params = ['accounting/enabled', 'accounting/hibernating', 'accounting/interval-end',
                  'accounting/bytes', 'accounting/bytes-left']

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

    @stem.control.with_default()
    def get_user(self, default=UNDEFINED):

        from platform import system

        # As stem's & Tor's implementations will return no valuable results on Windows
        # we diverge appropriately:

        user = None

        if self.is_localhost() and system() == 'Windows':

            from psutil import pid_exists, process_iter

            try:
                # This should (always) work!
                pid = self.get_pid()
            except:
                # OMG. Can't help!
                pass
            else:
                if pid_exists(pid):

                    # https://psutil.readthedocs.io/en/latest/#filtering-and-sorting-processes
                    procs = [p.info for p in process_iter(attrs=['pid', 'username']) if pid == p.info['pid']]

                    if len(procs) > 0:
                        user = procs[0]['username']

        else:
            user = super(Controller, self).get_user(default=default)

        # from stem.control.get_user()
        if user:
            self._set_cache({'user': user})
            return user
        else:
            raise ValueError("Unable to resolve tor's user" if self.is_localhost() else "Tor isn't running locally")


def create_controller(node, proxy=None, timeout=5):

    boxLog = logging.getLogger('theonionbox')

    mode = node['control']
    host = node['host']
    port = node['port']
    # cookie = node['cookie']

    if mode == 'socket':

        try:
            sockt = node['socket']
        except KeyError as exc:
            raise exc

        boxLog.info("Trying to connect to Tor ControlSocket @ '{}'...".format(sockt))
        contrlr = Controller.from_socket_file(sockt, timeout)

    elif mode == 'proxy':
        if proxy is None:
            raise ConnectionRefusedError('Proxy not defined.')

        try:
            cookie = node['cookie']
        except KeyError:
            pass
        else:
            if cookie is not None:
                if proxy.assure_cookie(host, cookie) is False:
                    raise ConnectionRefusedError('Unable to set cookie for {}.'.format(host))

        proxy_address = proxy.address()
        if proxy_address is None:
            raise ConnectionRefusedError('Proxy defined is not responding.')
        else:
            try:
                host_port = int(port)
            except ValueError:
                raise ConnectionRefusedError('Invalid port defined: {}'.format(port))
            boxLog.info(
                "Trying to connect to Tor @ '{}:{}' via Proxy @ '{}'...".format(host, host_port, proxy_address))
            contrlr = Controller.host_via_proxy(host, host_port, proxy_address, timeout)

    elif mode == 'port':
        boxLog.info('Trying to connect to Tor ControlPort {}:{}...'.format(host, port))
        if timeout:
            boxLog.info('Timeout set to {}s.'.format(timeout))
        contrlr = Controller.from_port_timeout(host, port, timeout)

    else:
        raise ValueError("node['control'] == {} is an invalid parameter.".format(mode))

    return contrlr
