from __future__ import absolute_import
from tob.deviation import getTimer
from math import floor
from time import time


class Recorder(object):
    interval = 1
    compensate = None
    reference_slot = time()
    basket = None

    def __init__(self, interval=1, compensate=True, timestamp=time(), **kwargs):

        assert (interval > 0)

        def dont_compensate(timestamp):
            return timestamp

        self.compensate = getTimer().compensate if compensate is True else dont_compensate
        self.interval = interval
        self.reference_slot = self._calc_slot(timestamp)

        self.basket = {}
        for key in kwargs:
            self.basket[key] = kwargs[key]

    def record(self, timestamp=time(), **kwargs):

        current_slot = self._calc_slot(timestamp)

        out = None

        if int(current_slot) != self.reference_slot:
            # If nothing was recorded - there's nothing to return!
            # print(self.basket)
            if len(self.basket) > 0:
                self.basket['timestamp'] = int(self.reference_slot * self.interval)
                out = self.basket

            self.reference_slot = current_slot
            self.basket = {}

        if current_slot == self.reference_slot:
            for key in kwargs:
                if key in self.basket:
                    self.basket[key] += kwargs[key]
                else:
                    self.basket[key] = kwargs[key]

        return out

    def get_interval(self):
        return self.interval

    def get_slot_start(self):
        return int(self.reference_slot * self.interval)

    def get(self, key):
        if key is 'timestamp':
            return self.reference_slot * self.interval
        return self.basket[key]

    def _calc_slot(self, timestamp):
        return int(floor(self.compensate(timestamp) / self.interval))