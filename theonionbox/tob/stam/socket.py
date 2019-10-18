from typing import Optional
import socket
import stem.socket


class ControlPort(stem.socket.ControlPort):

    def __init__(self, address: str = '127.0.0.1', port: int = 9051,
                 connect: bool = True, timeout: Optional[int] = None):

        self.timeout = timeout
        super(ControlPort, self).__init__(address=address, port=port, connect=connect)

    def _make_socket(self):
        control_socket = None
        try:
            control_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            if self.timeout is not None:
                control_socket.settimeout(self.timeout)
            control_socket.connect((self.address, self.port))
            return control_socket
        except socket.error as exc:
            if control_socket is not None:
                control_socket.close()
            raise stem.SocketError(exc)


class ControlSocketFile(stem.socket.ControlSocketFile):

    def __init__(self, path: str = '/var/run/tor/control', connect: bool = True, timeout: Optional[int] = None):

        self.timeout = timeout
        super(ControlSocketFile, self).__init__(path=path, connect=connect)

    def _make_socket(self):
        control_socket = None
        try:
            control_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            if self.timeout is not None:
                control_socket.settimeout(self.timeout)
            control_socket.connect(self.path)
            return control_socket
        except socket.error as exc:
            control_socket.close()
            raise stem.SocketError(exc)


class ControlProxy(stem.socket.ControlPort):

    def __init__(self, address: str, port: int, proxy: Optional[str] = None,
                 connect: bool = True, timeout: Optional[int] = None):

        self.timeout = timeout
        self.proxy = proxy
        super(ControlProxy, self).__init__(address=address, port=port, connect=connect)

    def _make_socket(self):

        import socks
        control_socket = None

        try:
            control_socket = socks.socksocket(socket.AF_INET, socket.SOCK_STREAM)
            if self.proxy is not None:
                prxy = self.proxy.split(':')
                if len(prxy) == 2:
                    control_socket.set_proxy(socks.SOCKS5, prxy[0], int(prxy[1]))
            if self.timeout is not None:
                control_socket.settimeout(self.timeout)
            control_socket.connect((self.address, self.port))
            return control_socket
        except socket.error as exc:
            control_socket.close()
            raise stem.SocketError(exc)
