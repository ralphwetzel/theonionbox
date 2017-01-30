from onionoo import Details, Bandwidth, Weights, Mode
from stem.util.connection import is_valid_ipv4_address, is_valid_ipv6_address, is_valid_port, is
from stem import SocketError
from tob.controller import tobController

import logging

class OnionooData(object):
    __details = None
    __bandwidth = None
    __weights = None

    def __init__(self, details, bandwidth, weights):
        self.__details = details
        self.__bandwidth = bandwidth
        self.__weights = weights

    def is_relay(self):
        return self.__details.is_relay()

    def is_bridge(self):
        return self.__details.is_bridge()

    def detail(self, detail):
        return self.__details(detail)

    def read(self, period=None):
        return self.__bandwidth.read(period)

    def write(self, period=None):
        return self.__bandwidth.write(period)

    def consensus_weight_fraction(self, period=None):
        return self.__weights.consensus_weight_fraction(period)

    def guard_probability(self, period=None):
        return self.__weights.guard_probability(period)

    def middle_probability(self, period=None):
        return self.__weights.middle_probability(period)

    def exit_probability(self, period=None):
        return self.__weights.exit_probability(period)

    def consensus_weight(self, period=None):
        return self.__weights.consensus_weight(period)

    def has_details(self):
        return self.__details.has_data() is not None

    def has_bandwidth(self):
        return self.__bandwidth.has_data() is not None

    def has_weights(self):
        return self.__weights.has_data() is not None


class TorNode(object):

    fingerprint = None

    address = None
    port = None

    proxy_address = None
    proxy_port = None

    timeout = 0

    path = None

    details = None
    bandwidth = None
    weights = None

    controller = None

    nodeLog = None
    torLog = None

    def __init__(self, fingerprint, proxy=None):
        self.fingerprint = fingerprint

        self.address = None
        self.port = None
        self.proxy_address = None
        self.proxy_port = None
        self.timeout = None

        if proxy is None:
            self.details = Details(Mode.OPEN, None)
            self.bandwidth = Bandwidth(Mode.OPEN, None)
            self.weights = Weights(Mode.OPEN, None)
        else:
            self.proxy(proxy, True)

        self.nodeLog = logging.getLogger(fingerprint)
        self.nodeLog.debug('Node initiated for FP {}.'.format(fingerprint))

    def proxy(self, proxy, reconnect=True):

        try:
            address, port = proxy.split(':')
        except ValueError:
            # if 'not enough values to unpack', e.g. no port given
            raise ValueError("Failed to separate address '{}' into address:port.".format(proxy))

        if not is_valid_ipv4_address(address):
            raise ValueError('Invalid IP address: %s' % address)
        elif not is_valid_port(port):
            raise ValueError('Invalid port: %s' % port)

        self.proxy_address = address
        self.proxy_port = port

        if reconnect is True:
            self.details = Details(Mode.HIDDEN, proxy)
            self.bandwidth = Bandwidth(Mode.HIDDEN, proxy)
            self.weights = Weights(Mode.HIDDEN, proxy)

            if self.controller is not None:
                pass

    def connect(self, address, timeout=None):

        ip = None
        port = None
        proxy_ip = None
        proxy_port = None

        if self.controller is not None:
            self.controller.close()
            self.controller = None

        try:
            ip, port = address.split(':')
        except ValueError:
            # if 'not enough values to unpack', e.g. no port given
            self.nodeLog.debug("Failed to separate address '{}' into address:port.".format(address))
            return False

        if not (is_valid_ipv4_address(ip) or is_valid_ipv6_address(ip, True)):
            self.nodeLog.debug("'{}' is no valid IP address.".format(ip))
            return False

        if not is_valid_port(port, False):
            self.nodeLog.debug("'{}' is no valid port.".format(port))
            return False

        if proxy is not None:
            try:
                proxy_ip, proxy_port = proxy.split(':')
            except ValueError:
                # if 'not enough values to unpack', e.g. no port given
                self.nodeLog.debug("Failed to separate proxy '{}' into address:port.".format(proxy))
                return False

            if not (is_valid_ipv4_address(proxy_ip) or is_valid_ipv6_address(proxy_ip, True)):
                self.nodeLog.debug("'{}' is no valid IP address.".format(proxy_ip))
                return False

            if not is_valid_port(proxy_port, False):
                self.nodeLog.debug("'{}' is no valid port.".format(proxy_port))
                return False

            try:
                self.controller = tobController.from_port_proxy(ip, port, proxy_ip, proxy_port, timeout)
            except SocketError as err:
                self.nodeLog.debug("Failed to connect to Tor on {} via proxy {}: {}".format(address, proxy, err))
                return False

            self.nodeLog.info('Connected to Tor on {} via proxy {}.'.format(address, proxy))
            self.proxy = proxy_ip
            self.proxy_port = proxy_port

        else:

            try:
                self.controller = tobController.from_port(ip, port, timeout)
            except SocketError as err:
                self.nodeLog.debug("Failed to connect to Tor on {}: {}".format(address, err))
                return False

            self.nodeLog.info('Connected to Tor on {}.'.format(address))

        self.address = ip
        self.port = port
        self.timeout = timeout
        return True

    def reconnect(self):

        if self.controller is not None:
            self.controller.connect()
            return True
        else:
            return False


        #
        # # ensure that our tor related information is aways current
        # update_tor_info()
        # box_cron.add_job(update_tor_info, 'interval', minutes=1)
        #
        # # start the event handler for the Bandwidth data
        # tor.add_event_listener(functools.partial(handle_livedata), EventType.BW)
        #
        # return tor

    def connect_socket(self, path, timeout=None):
        try:
            self.controller = tobController.from_socket_file(path, timeout)
        except SocketError as err:
            self.nodeLog.debug("Failed to connect to Tor via socket '{}': {}".format(path, err))
            return False

        self.path = path
        return True

    def get_fingerprint(self):
        return self.fingerprint

    def refresh(self):
        self.details.refresh(self.fingerprint)
        self.bandwidth.refresh(self.fingerprint)
        self.weights.refresh(self.fingerprint)

    def onionoo(self):
        return OnionooData(self.details, self.bandwidth, self.weights)

