from typing import Optional
import logging
from threading import RLock
# from tob.configuration import BaseNodeConfig
from tob.config import ProxyConfig


class Proxy:

    def __init__(self, config: ProxyConfig):

        self.config = config
        self.controller = None
        self.cookie_backup = None
        self.log = logging.getLogger('theonionbox')
        self.lock = RLock()

    def address(self) -> Optional[str]:

        #####
        # Proxy configuration
        from contextlib import closing
        from socks import socksocket
        from socket import AF_INET, SOCK_STREAM

        try:
            if self.config.proxy == 'auto':
                with closing(socksocket(AF_INET, SOCK_STREAM)) as sock:
                    if sock.connect_ex((self.config.host, 9050)) == 0:
                        self.config.proxy = 9050

            if self.config.proxy == 'auto':
                with closing(socksocket(AF_INET, SOCK_STREAM)) as sock:
                    if sock.connect_ex((self.config.host, 9150)) == 0:
                        self.config.proxy = 9150

            if self.config.proxy == 'auto':
                return None
            else:
                return '{}:{}'.format(self.config.host, self.config.proxy)

        except:
            return None

    @property
    def host(self):
        check = self.address()
        if check is None:
            return None
        return self.config.host

    @property
    def port(self):
        check = self.address()
        if check is None:
            return None
        return self.config.proxy


    def assure_cookie(self, host: str, cookie: str) -> bool:

        from stam.control import Controller
        import threading

        if host is None or cookie is None:
            return True

        # As a single Proxy instance is shared by all nodes, we have to ensure that there's no thread collision here
        with self.lock:

            if self.controller is None:
                try:
                    # self.controller = create_controller(mode=self.node.control,
                    #                                     host=self.node.host,
                    #                                     control_port=self.node.port,
                    #                                     control_socket=self.node.socket)

                    self.controller = Controller.from_config(self.config)

                except:
                    self.log.debug('Failed to create controller.')
                    return False

            if self.controller.is_authenticated() is False:
                try:
                    self.controller.authenticate()
                except Exception as exc:
                    self.log.debug(f'Failed to authenticate: {exc}')
                    return False

            if self.cookie_backup is None:
                self.cookie_backup = self.controller.get_conf('HidServAuth', default=[], multiple=True)

            try:
                self.controller.set_conf('HidServAuth', '{} {}'.format(host, cookie))
            except:
                self.log.debug('Failed to set Hidden Service Authentication cookie.')
                return False

            try:
                check = self.controller.get_conf('HidServAuth', default=[], multiple=True)
            except:
                self.log.debug('Failed to confirm Hidden Service Authentication cookie.')
                return False

            ok = False
            for cookie_line in check:
                cl = cookie_line.split(" ")
                if len(cl) == 2:
                    if cl[0] == host and cl[1] == cookie:
                        ok = True
                        break

            self.log.debug('Hidden Service Authentication cookie {}.'.format('confirmed' if ok is True else 'missing'))
            return ok

    def shutdown(self):
        # boxLog = logging.getLogger('theonionbox')
        if self.controller is not None:

            if self.controller.is_alive() is False:
                self.controller.connect()
            if self.controller.is_authenticated() is True:
                self.controller.reset_conf('HidServAuth')
                if len(self.cookie_backup) > 0:
                    for cookie_line in self.cookie_backup:
                        self.log.debug('Restoring Hidden Service Authentication cookie.')
                        self.controller.set_conf('HidServAuth', cookie_line)
            else:
                self.log.debug('Failed to authenticate controller.')

            self.log.debug('Closing controller.')
            self.controller.close()
