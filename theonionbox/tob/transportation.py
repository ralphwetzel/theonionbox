import typing
import stem.response.events
import contextlib
import threading
import collections


class Base:

    def __init__(self):
        self.base_count = 0
        self.tags = set()
        self.buffer = collections.deque(maxlen=1000)
        self.clear_tags = False
        self.marker = 'VOID'

    @property
    def count(self) -> int:

        if self.clear_tags:
            self.tags = set()
            self.clear_tags = False

        # print(self.tags)
        # print(self.buffer)

        while True:
            try:
                event = self.buffer.popleft()
            except IndexError:
                break

            # print(event)

            # event format e.g.'ORCONN endpoint status ...'
            event = event.split(' ')
            if len(event) >= 3 and event[0] == self.marker:
                self.process(id=event[1], status=event[2])

        return len(self.tags)

    def add(self, tag: str):
        self.tags.add(tag)

    def remove(self, tag: str):
        with contextlib.suppress(KeyError):
            self.tags.remove(tag)

    def push(self, event: stem.response.events.Event):
        self.buffer.append(str(event))

    def process(self, id: str, status: str):
        raise NotImplementedError()

    def rebase(self, status: str):
        lines = status.split('\n')
        for line in lines:
            self.buffer.append('{} {}'.format(self.marker, line))
        self.clear_tags = True

        # print(len(lines))


class Connections(Base):

    def __init__(self):
        super().__init__()
        self.marker = 'ORCONN'

    def process(self, id: str, status: str):

        # event format = 'ORCONN endpoint status ...'
        if status in ['CONNECTED']:
            self.add(id)
        elif status in ['FAILED', 'CLOSED']:
            self.remove(id)


class Circuits(Base):

    def __init__(self):
        super().__init__()
        self.marker = 'CIRC'

    def process(self, id: str, status: str):

        # event format = 'CIRC id status ...'
        if status in ['LAUNCHED', 'BUILT']:
            self.add(id)
        elif status in ['FAILED', 'CLOSED']:
            self.remove(id)


class Streams(Base):

    def __init__(self):
        super().__init__()
        self.marker = 'STREAM'

    def process(self, id: str, status: str):

        # event format = 'STREAM id status ...'
        if status in ['SUCCEEDED']:
            self.add(id)
        elif status in ['FAILED', 'CLOSED']:
            self.remove(id)
