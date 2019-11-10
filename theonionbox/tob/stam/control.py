from typing import Callable, Optional, Union, List
import stem.control
import stem.util
from stam.socket import ControlPort, ControlSocketFile, ControlProxy
#from configuration.node import BaseNodeConfig
import logging
from stem import SocketError, UNDEFINED
from stem.response.protocolinfo import ProtocolInfoResponse
from stem.connection import IncorrectPassword, IncorrectSocketType, AuthenticationFailure, AuthMethod, MissingPassword
from stem.control import EventType
from tob.proxy import Proxy as TorProxy
from tob.config import DefaultNodeConfig
from tob.ccfile import CCNode

#####
# Extensive monkey patching of stem.control.BaseController
# to splice into stem.control.BaseController._post_authentication
if not hasattr(stem.control.BaseController, 'register_post_auth_callback'):

    #####
    # __init__: add self._tob_callback

    __BC_original_init = stem.control.BaseController.__init__

    def __baseController_init(self, control_socket: stem.socket.ControlSocket, is_authenticated: Optional[bool] = False):
        self._tob_callback = None
        __BC_original_init(self, control_socket, is_authenticated)
        return

    stem.control.BaseController.__init__ = __baseController_init
    ###

    #####
    # additional function: register_post_auth_callback
    def register_post_auth_callback(self, callback: Callable[[], None]) -> None:
        self._tob_callback = callback
        if self.is_authenticated():
            # if control_socket was already authenticated at __init__,
            # the super(...)._post_authentication() actions have been performed by __init__!
            callback()

    stem.control.BaseController.register_post_auth_callback = register_post_auth_callback
    ###

    #####
    # _post_authentication: to call _tob_callback
    __BC_original_post_auth = stem.control.BaseController._post_authentication

    def __baseController_post_auth(self):
        __BC_original_post_auth(self)
        if self._tob_callback is not None:
            self._tob_callback()

    stem.control.BaseController._post_authentication = __baseController_post_auth
    ###


class Controller(stem.control.Controller):

    @staticmethod
    def from_port(address: Optional[str] = '127.0.0.1', port: Optional[Union[int, str]] = 'auto',
                  timeout: Optional[int] = None) -> 'Controller':

        import stem.connection

        # timeout management
        if timeout and timeout < 0:
            timeout = None

        if not stem.util.connection.is_valid_ipv4_address(address):
            raise ValueError('Invalid IP address: %s' % address)
        elif port != 'auto' and not stem.util.connection.is_valid_port(port):
            raise ValueError('Invalid port: %s' % port)

        if port == 'auto':
            try:
                control_port = ControlPort(address=address, port=9051, timeout=timeout)
                return Controller(control_port)
            except SocketError as exc:
                try:
                    control_port = ControlPort(address=address, port=9151, timeout=timeout)
                    return Controller(control_port)
                except SocketError:
                    raise exc
        else:
            control_port = ControlPort(address=address, port=int(port), timeout=timeout)
            return Controller(control_port)

    @staticmethod
    def from_socket_file(path: Optional[str] = '/var/run/tor/control',
                         timeout: Optional[int] = None) -> 'Controller':
        control_socket = ControlSocketFile(path=path, timeout=timeout)
        return Controller(control_socket)

    @staticmethod
    def from_port_via_proxy(address: str, port: int, proxy: Optional[str] = None,
                            timeout: Optional[int] = None) -> 'Controller':
        control_port = ControlProxy(address=address, port=port, proxy=proxy, timeout=timeout)
        return Controller(control_port)

    @staticmethod
    def from_config(config: Union[DefaultNodeConfig, CCNode],
                    timeout: Optional[int] = None,
                    proxy: Optional[TorProxy] = None) -> 'Controller':

        if config.control == 'socket':
            try:
                contrlr = Controller.from_socket_file(config.socket, timeout)
            except AttributeError:
                try:
                    contrlr = Controller.from_socket_file(config.host, timeout)
                except AttributeError:
                    raise ConnectionRefusedError('Socket not defined.')

        elif config.control == 'proxy':
            if proxy is None:
                raise ConnectionRefusedError('Proxy not defined.')

            if config.cookie is not None:
                if proxy.assure_cookie(config.host, config.cookie) is False:
                    raise ConnectionRefusedError('Unable to set cookie for {}.'.format(config.host))

            proxy_address = proxy.address()
            if proxy_address is None:
                raise ConnectionRefusedError('Proxy defined is not responding.')
            else:
                try:
                    host_port = int(config.port)
                except ValueError:
                    raise ConnectionRefusedError('Invalid port defined: {}'.format(config.port))
                contrlr = Controller.from_port_via_proxy(address=config.host, port=host_port,
                                                         proxy=proxy_address, timeout=timeout)

                contrlr.via_proxy = True
                if config.cookie is not None:
                    contrlr.with_cookie = True

        elif config.control == 'port':
            contrlr = Controller.from_port(address=config.host, port=config.port, timeout=timeout)

        else:
            # print(config.control)
            raise ValueError("mode == {} is an invalid parameter.".format(config.control))

        return contrlr

    def __init__(self, control_socket: stem.socket.ControlSocket, is_authenticated: Optional[bool] = False):
        super(Controller, self).__init__(control_socket, is_authenticated)

        self._password = None
        self.via_proxy = False
        self.with_cookie = False
        self.auth_password = False

    @property
    def flags(self) -> List[str]:

        fp = self.fingerprint
        flags = ['unknown']
        if fp:
            # There's some ugly behaviour in GETINFO("ns/id/...")
            # see https://trac.torproject.org/projects/tor/ticket/7646
            # and https://trac.torproject.org/projects/tor/ticket/7059
            # This behaviour seems to be uncoverable!
            try:
                result = self.get_info('ns/id/{}'.format(fp))
            except stem.InvalidArguments:
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

        return flags

    @property
    def version_short(self) -> str:
        v = self.get_version()
        return '{}.{}.{}.{}'.format(v.major, v.minor, v.micro, v.patch) if v else ''

    @property
    def version_current(self) -> str:
        return self.get_info('status/version/current', 'unknown')

    @property
    def fingerprint(self) -> str:
        return self.get_info('fingerprint', '')

    @property
    def address(self) -> str:
        return self.get_info('address', '')

    @property
    def nickname(self) -> str:
        return self.get_conf('Nickname', '')

    @property
    def contactInfo(self) -> str:
        return self.get_conf('ContactInfo', '')

    @property
    def controlSocket(self) -> str:
        return self.get_conf('ControlSocket', '')

    @property
    def hashedControlPassword(self) -> str:
        return self.get_conf('HashedControlPassword', None)

    @property
    def isAuthPassword(self) -> bool:
        return self.hashedControlPassword is not None

    @property
    def cookieAuthentication(self) -> str:
        return self.get_conf('CookieAuthentication', '0')

    @property
    def cookieAuthFile(self) -> str:
        return self.get_conf('CookieAuthFile', '')

    @property
    def isAuthCookie(self) -> bool:
        return self.cookieAuthentication == '1'

    @property
    def user(self) -> str:

        from platform import system

        # As stem's & Tor's implementations will return no valuable results on Windows
        # we diverge appropriately:

        user = None

        if self.is_localhost() and system() == 'Windows':

            from psutil import pid_exists, process_iter

            try:
                # This should (always) work!
                pid = self.get_pid()
            except Exception:
                # OMG. Can't help!
                pass
            else:
                if pid_exists(pid):

                    # https://psutil.readthedocs.io/en/latest/#filtering-and-sorting-processes
                    procs = [p.info for p in process_iter(attrs=['pid', 'username']) if pid == p.info['pid']]

                    if len(procs) > 0:
                        user = procs[0]['username']

            if user:
                self._set_cache({'user': user})
                return user
            else:
                raise ValueError("Unable to resolve tor's user" if self.is_localhost() else "Tor isn't running locally")

        # default from stem
        return self.get_user()

    def authenticate(self,
                     password: Optional[str] = None,
                     chroot_path: Optional[str] = None,
                     protocolinfo_response: Optional[ProtocolInfoResponse] = None):

        if not protocolinfo_response:
            try:
                protocolinfo_response = self.get_protocolinfo()
            except stem.ProtocolError:
                raise IncorrectSocketType('unable to use the control socket')
            except stem.SocketError as exc:
                raise AuthenticationFailure('socket connection failed (%s)' % exc)

        # Check for PASSWORD authentication and verify against stored password... if available
        auth_methods = list(protocolinfo_response.auth_methods)
        if len(auth_methods) > 0 and auth_methods[0] == AuthMethod.PASSWORD:

            self.auth_password = True

            if password is None:
                raise MissingPassword('No passphrase provided.')

            if self.is_authenticated() is True:
                assert(self._password is not None)
                if password != self._password:
                    raise IncorrectPassword('Passphrase incorrect.')
                return

        if self.is_authenticated() is False:
            super(Controller, self).authenticate(password, chroot_path, protocolinfo_response)

            # store password if used for authentication
            if (len(auth_methods) > 0 and auth_methods[0] == AuthMethod.PASSWORD) and password is not None:
                self._password = password

        return  # there's no return value; if something goes wrong, this will raise.

    @property
    def password(self) -> str:
        return self._password

    @stem.control.with_default()
    def get_accounting_stats(self, default=UNDEFINED):

        import pytz

        accs = super(Controller, self).get_accounting_stats()

        # stem returns a naive datetime object for interval_end
        # which creates extra effort afterwards.
        # So we convert this to a timezone aware datetime to correct things...

        ie = pytz.utc.localize(accs.interval_end)
        return accs._replace(interval_end=ie)
