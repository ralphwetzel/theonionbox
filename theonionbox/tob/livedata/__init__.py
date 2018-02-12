from __future__ import absolute_import
from time import time
from collections import deque
# from math import floor
import itertools
# from tob_time import TimeManager
from threading import RLock
from tob.deviation import getTimer
import logging
from .recorder import Recorder

# class tob_list(list):
#
#     def append(self, p_object):
#         list.append(self, p_object)


class Manager(object):

    # this flag is to ensure that at least once '0/0' is recorded
    # into the records after 'relevant' data was received
    # this is to make our charts look great!
    last_bandwidth_not_zero = True

    # bandwidth_hd_record = deque(maxlen=900)     # a deque of dicts, one dict per second, max 900 secs (= 15+ minutes)
    # bandwidth_ld_record = deque(maxlen=1440)    # an increasing deque of dict; one dict per minute; max 24h

    # minute_of_last_record = 0                   # flag to check if to add a new minute record to bandwidth_ld_record

#    bandwidth_history_read = deque()    # a deque of arrays; one array per day; unlimited
#    bandwidth_history_write = deque()   # a deque of arrays; one array per day; unlimited
#    history_hour = 0                    # this is the hour we're just recording for the history
#    bandwidth_history_today = []        #

    # TODO: Can this overflow?
    # bandwidth_total = {'up': 0, 'down': 0}      # all the data we've recorded are cumulated here;
    # bandwidth_total = {}

    # basis_total_read = 0
    # basis_total_written = 0
    bandwidth_total_read = 0
    bandwidth_total_written = 0

    # bandwidth_total_count = 0

    # to ensure thread resistance
    live_Lock = None

    recorders = {}
    bandwidths = {}

    def __init__(self):

        log = logging.getLogger('theonionbox')
        log.debug('Creating LiveDataManager...')

        self.recorders = {
            # '1s': Recorder(interval=1),         # 1 second
            '1m': Recorder(interval=60),        # interval: 1 minute
            '15m': Recorder(interval=60*15),     # 15 minutes - to generate "3 days" graph
            '1h': Recorder(interval=60*60),     # 60 minutes - to generate "1 week" graph
            '4h': Recorder(interval=60*60*4),   # 4 hours - to generate "1 month" graph
            '12h': Recorder(interval=60*60*12),  # 12 hours - to generate "3 month" graph
        }

        # a deque of dicts, one dict per second, max 1500 secs (= 25 minutes)
        # Watch out: {} explicitely necessary here to instantiate class variable!!!
        self.bandwidths = {'1s': deque(maxlen=1500)}
        for key in self.recorders:
            # a deque of dicts, one dict per interval, max 1500 items
            self.bandwidths[key] = deque(maxlen=1500)

        self.bandwidth_total_read = 0
        self.bandwidth_total_written = 0

        # to ensure thread resistance
        self.live_Lock = RLock()

        # record '0,0' a minute ago to initialize
        self.last_bandwidth_not_zero = True
        self.record_bandwidth(time_stamp=time() - 60)

    def record_bandwidth(self, time_stamp=None, bytes_read=0, bytes_written=0, compensate_deviation=True):

        timer = getTimer()

        if time_stamp is None:
            time_stamp = time()

        if compensate_deviation is True:
            time_stamp = timer.compensate(time_stamp)

        # minute_of_current_record = floor(time_stamp / 60)   # minutes for LD
        js_time_stamp = int(time_stamp*1000)                # ms for JS!

        new_lbwnz = bytes_read > 0 or bytes_written > 0     # True if there's data to be recorded

        if new_lbwnz or self.last_bandwidth_not_zero:       # This ensures, that we're recording once '0,0' after data

            # total counting data
            self.bandwidth_total_read += bytes_read
            self.bandwidth_total_written += bytes_written

            # bytes_read = download = < 0
            bytes_read *= (-1)

            # HD Data
            self.live_Lock.acquire()

            self.bandwidths['1s'].append({'s': js_time_stamp,
                                          'r': bytes_read,
                                          'w': bytes_written,
                                          'tr': self.bandwidth_total_read,
                                          'tw': self.bandwidth_total_written
                                          })

            # Long term data
            for key in self.recorders:

                # return value != None if new interval started; rec then former interval cumulated
                rec = self.recorders[key].record(timestamp=time_stamp,
                                                 read=bytes_read,
                                                 written=bytes_written)
                if rec is not None:

                    interval = self.recorders[key].get_interval()
                    # print(rec, interval)

                    self.bandwidths[key].append({'s': js_time_stamp,
                                                     'm': int(rec['timestamp'])*1000,    # Javascript timestamp
                                                     # 'r': rec['read'] / float(interval),
                                                     # 'w': rec['written'] / float(interval),
                                                 'r': rec.get('read', 0),
                                                 'w': rec.get('written', 0),
                                                 })

            self.live_Lock.release()

        self.last_bandwidth_not_zero = new_lbwnz

    # def get_data_hd(self, limit=None):
    #     # return HD Data; limit is in seconds
    #     self.hd_Lock.acquire()
    #     length = len(self.bandwidth_hd_record)
    #     if limit is None or length <= limit:
    #         retval = list(self.bandwidth_hd_record)
    #     else:
    #         retval = list(itertools.islice(self.bandwidth_hd_record, length - limit, limit))
    #     self.hd_Lock.release()
    #     return retval
    #
    # def get_data_ld(self, limit=None):
    #     # return LD Data; limit is in minutes
    #     self.ld_Lock.acquire()
    #     length = len(self.bandwidth_ld_record)
    #     if limit is None or length <= limit:
    #         retval = list(self.bandwidth_ld_record)
    #     else:
    #         retval = list(itertools.islice(self.bandwidth_ld_record, length - limit, limit))
    #     self.ld_Lock.release()
    #     return retval
    #
    # def get_data_hd_since(self, since_timestamp=None):
    #     # return HD Data; limit is a given timestamp
    #     if since_timestamp is None:
    #         return self.get_data_hd()
    #     else:
    #         self.hd_Lock.acquire()
    #         retval = list(itertools.dropwhile(lambda x: x['s'] < since_timestamp, self.bandwidth_hd_record))
    #         self.hd_Lock.release()
    #         return retval
    #
    # def get_data_ld_since(self, since_timestamp=None):
    #     # return LD Data; limit is a given timestamp
    #     if since_timestamp is None:
    #         return self.get_data_ld()
    #     else:
    #         self.ld_Lock.acquire()
    #         retval = list(itertools.dropwhile(lambda x: x['s'] < since_timestamp, self.bandwidth_ld_record))
    #         self.ld_Lock.release()
    #         return retval

    def get_data(self, interval='1s', since_timestamp=None, limit=None):

        # This could raise a KeyError, if wrong 'interval' used.
        # This is done by intension!
        bw = self.bandwidths[interval]

        self.live_Lock.acquire()
        if since_timestamp is None:
            retval = list(bw)
        else:
            retval = list(itertools.dropwhile(lambda x: x['s'] < since_timestamp, bw))

        self.live_Lock.release()

        if limit is not None:
            return retval[:limit]

        return retval

    # def get_data_total(self):
    #     # return the total amount of data we culumated
    #     return self.bandwidth_total
    #
    # def get_average(self):
    #     # return the average rate / s
    #     # more precisely: it's the average rate per received data
    #     retval = self.bandwidth_total
    #
    #     retval['r'] /= self.bandwidth_total_count
    #     retval['w'] /= self.bandwidth_total_count
    #     return retval

    # def reset_data_total(self):
    #     # reset the total counters
    #     self.bandwidth_total = {}
    #     return

    # def init_total_basis(self, bytes_read, bytes_written):
    #     self.basis_total_read = bytes_read
    #     self.basis_total_written = bytes_written
    #     self.bandwidth_total_read = 0
    #     self.bandwidth_total_written = 0
    #     self.bandwidth_total_count = 0
    #     return

    def set_traffic(self, traffic_read, traffic_written):

        self.bandwidth_total_read = traffic_read
        self.bandwidth_total_written = traffic_written

