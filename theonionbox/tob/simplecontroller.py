import threading
# from socks import socksocket
from socket import socket, AF_INET, SOCK_STREAM

# "Thanks" to stem!
try:
  # Added in 3.x
  import queue
except ImportError:
  import Queue as queue


class SimpleController(object):

    _socket = None

    def __init__(self):

        assert (self._socket is not None), 'SimpleController is not initialized!'

        self.msg_queue = queue.Queue()
        self._is_alive = True
        self._msg_lock = threading.RLock()

        self._reader_thread = threading.Thread(target=self._reader, name='TOB')
        self._reader_thread.setDaemon(True)
        self._reader_thread.start()

    def _reader(self):
        while self._is_alive:
            try:
                control_message = self._socket.recv(4096)
                self.msg_queue.put(control_message)
            except Exception as exc:
                pass

    def shutdown(self):
        self._socket.close()
        self._is_alive = False

    def msg(self, message):

        message += '\r\n'

        with self._msg_lock:

            while not self.msg_queue.empty():
                try:
                    response = self.msg_queue.get_nowait()
                except queue.Empty:
                    break

        try:
            self._socket.send(str.encode(message))
            response = self.msg_queue.get()
            return response.decode('UTF-8')

        except Exception:
            self.shutdown()
            raise


class SimplePort(SimpleController):

    def __init__(self, host, port):

        self._socket = socket(AF_INET, SOCK_STREAM)
        self._socket.settimeout(2)

        # This could raise an exception ...
        # ... which is intended!
        self._socket.connect((host, port))

        super(SimplePort, self).__init__()


class SimpleSocket(SimpleController):

    def __init__(self, socket_path):
        from socket import AF_UNIX
        self._socket = socket(AF_UNIX, SOCK_STREAM)
        self._socket.settimeout(2)

        # This could raise an exception ...
        # ... which is intended!
        self._socket.connect(socket_path)

        super(SimpleSocket, self).__init__()


class SimpleProxy(SimpleController):

    def __init__(self, host, port, proxy_host, proxy_port):

        import socks

        self._socket = socks.socksocket(AF_INET, SOCK_STREAM)
        self._socket.settimeout(15)
        self._socket.set_proxy(socks.SOCKS5, proxy_host, proxy_port, rdns=True)

        # This could raise an exception ...
        # ... which is intended!
        self._socket.connect((host, port))

        super(SimpleProxy, self).__init__()
