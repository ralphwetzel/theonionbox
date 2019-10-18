import typing
from utils import AttributedDict


class NodeConfig(AttributedDict):

    @property
    def is_default_node(self) -> bool:
        return False

    # to allow transfer of 'auto' to 9x51
    @property
    def port(self):
        try:
            return self['port']
        except:
            raise AttributeError('port')

    @port.setter
    def port(self, value):
        try:
            self['port'] = value
        except:
            raise AttributeError('port')


class DefaultNodeConfig(NodeConfig):

    @property
    def is_default_node(self) -> bool:
        return True

    @property
    def name(self):
        return None # indicates the default node!


class ProxyConfig(NodeConfig):

    # to allow transfer of 'auto' to 9x50
    @property
    def proxy(self):
        try:
            return self['proxy']
        except:
            raise AttributeError('proxy')

    @proxy.setter
    def proxy(self, value):
        try:
            self['proxy'] = value
        except:
            raise AttributeError('proxy')

