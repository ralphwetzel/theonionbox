from typing import Optional, List
# from configuration import BaseNodeConfig, DefaultNodeConfig
from .node import Node
from persistor import Storage
import time
from tob.config import DefaultNodeConfig
from ccfile import CCNode

class Manager(object):

    def __init__(self, default: DefaultNodeConfig, database: Storage, timeout: Optional[int] = 5):

        d = Node(default, database, 'theonionbox')

        self.database = database
        self.nodes = {'theonionbox': d}
        self.sequence = ['theonionbox']
        self.timeout = timeout
        self._last_modified = self.get_time()

    def node_add(self, configuration: CCNode) -> str:
        n = Node(configuration, self.database)
        self.nodes[n.id] = n

        # establish the chaining of the nodes
        self.sequence.append(n.id)

        # update mod indicator
        self._last_modified = self.get_time()

        return n.id

    def get(self, id: str) -> Node:
        if id in self.nodes:
            return self.nodes[id]
        raise KeyError("Node ID '{}' does not exist.".format(id))

    def get_name(self, name: str) -> Optional[Node]:
        for key, node in self.nodes.items():
            if node.config.name == name:
                return node

        return None

    def __getitem__(self, item: str) -> Optional[Node]:
        return self.get(item)

    def __iter__(self):
        for id in self.sequence:
            yield self.nodes[id]

    def node_remove(self, id: str):
        if id == 'theonionbox':
            raise KeyError("Node ID '{}' shall never be removed.".format(id))

        if id in self.nodes:
            node = self.nodes[id]
            node.shutdown()
            del self.nodes[id]
            self.sequence.remove(id)
        else:
            raise KeyError("Node ID '{}' does not exist.".format(id))

        # update mod indicator
        self._last_modified = self.get_time()

    def shutdown(self):
        for id in self.nodes:
            node = self.nodes[id]
            node.shutdown()
        self.nodes = None

        # update mod indicator
        self._last_modified = self.get_time()

    def next(self, id:str) -> Optional[Node]:
        try:
            i = self.sequence.index(id)
        except ValueError:
            raise KeyError("Node ID '{}' does not exist.".format(id))

        if i == len(self.sequence) - 1:
            return None
        return self.nodes[self.sequence[i]]

    def position_node_at(self, id: str, position: str):

        if id in self.sequence:
            if position in self.sequence:

                if id == position:
                    return

                # remove the old entry
                self.sequence.remove(id)
                # find new position
                n = self.sequence.index(position)
                # insert it there
                self.sequence.insert(n, id)

                # update mod indicator
                self._last_modified = self.get_time()

            else:
                raise KeyError("Node ID '{}' does not exist.".format(position))
        else:
            raise KeyError("Node ID '{}' does not exist.".format(id))

    @property
    def last_modified(self):
        return self._last_modified

    @staticmethod
    def get_time():
        return time.time()

    @property
    def keys(self) -> List[str]:
        return self.sequence.copy()