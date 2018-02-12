from __future__ import absolute_import
from tob.deviation import getTimer
from math import floor
from time import time


class Recorder(object):
    interval = 1
    compensate = None
    reference_time = time()
    basket = None

    def __init__(self, interval=1, compensate=True, timestamp=time(), **kwargs):

        assert (interval > 0)

        def dont_compensate(timestamp):
            return timestamp

        self.compensate = getTimer().compensate if compensate is True else dont_compensate

        self.interval = interval
        self.reference_time = floor(self.compensate(timestamp) / self.interval)

        self.basket = {}
        for key in kwargs:
            self.basket[key] = kwargs[key]

    def record(self, timestamp=time(), **kwargs):

        current_reference_time = floor(self.compensate(timestamp) / self.interval)

        out = None

        if int(current_reference_time) != self.reference_time:
            self.basket['timestamp'] = self.reference_time * self.interval
            out = self.basket

            self.reference_time = int(current_reference_time)
            self.basket = {}

        if int(current_reference_time) == self.reference_time:
            for key in kwargs:
                if key in self.basket:
                    self.basket[key] += kwargs[key]
                else:
                    self.basket[key] = kwargs[key]

        return out

    def get_interval(self):
        return self.interval

    def get(self, key):
        if key is 'timestamp':
            return self.reference_time * self.interval

        return self.basket[key]
