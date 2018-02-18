import logging


class Proxy(object):

    def __init__(self, config):
        self.config = config
        self.controller = None

        self.host = config.get('host', '127.0.0.1')
        self.port = config.get('port', 'default')

        self.cookie_backup = None

    def address(self):

        #####
        # Proxy configuration
        from contextlib import closing
        from socks import socksocket
        from socket import AF_INET, SOCK_STREAM

        try:
            if self.port == 'default':
                with closing(socksocket(AF_INET, SOCK_STREAM)) as sock:
                    if sock.connect_ex((self.host, 9050)) == 0:
                        self.port = 9050

            if self.port == 'default':
                with closing(socksocket(AF_INET, SOCK_STREAM)) as sock:
                    if sock.connect_ex((self.host, 9150)) == 0:
                        self.port = 9150

            if self.port == 'default':
                return None
            else:
                return '{}:{}'.format(self.host, self.port)

        except:
            return None

    def assure_cookie(self, host, cookie):

        from controller import create_controller
        boxLog = logging.getLogger('theonionbox')

        if host is None or cookie is None:
            return True

        if self.controller is None:
            try:
                self.controller = create_controller(self.config, None, None)
            except:
                boxLog.debug('Failed to create controller.')
                return False

        if self.controller.is_authenticated() is False:
            try:
                self.controller.authenticate()
            except Exception as exc:
                boxLog.debug('Failed to authenticate.')
                return False

        if self.cookie_backup is None:
            self.cookie_backup = self.controller.get_conf('HidServAuth', default=[], multiple=True)

        try:
            self.controller.set_conf('HidServAuth', '{} {}'.format(host, cookie))
        except:
            boxLog.debug('Failed to set Hidden Service Authentication cookie.')
            return False

        try:
            check = self.controller.get_conf('HidServAuth', default=[], multiple=True)
        except:
            boxLog.debug('Failed to confirm Hidden Service Authentication cookie.')
            return False

        ok = False
        for cookie_line in check:
            cl = cookie_line.split(" ")
            if len(cl) == 2:
                if cl[0] == host and cl[1] == cookie:
                    ok = True
                    break

        boxLog.debug('Hidden Service Authentication cookie {}.'.format('confirmed' if ok is True else 'missing'))
        return ok

    def shutdown(self):
        boxLog = logging.getLogger('theonionbox')
        if self.controller is not None:

            if self.controller.is_alive() is False:
                self.controller.connect()
            if self.controller.is_authenticated() is True:
                self.controller.reset_conf('HidServAuth')
                if len(self.cookie_backup) > 0:
                    for cookie_line in self.cookie_backup:
                        boxLog.debug('Restoring Hidden Service Authentication cookie.')
                        self.controller.set_conf('HidServAuth', cookie_line)
            else:
                boxLog.debug('Failed to authenticate controller.')

            boxLog.debug('Closing controller.')
            self.controller.close()
