__author__ = ''

from time import time
from collections import deque
from math import floor
import itertools
# from tob_time import TimeManager
from threading import RLock

class LiveDataManager(object):

    # this flag is to ensure that at least once '0/0' is recorded
    # into the records after 'relevant' data was received
    # this is to make our charts look great!
    last_bandwidth_not_zero = True

    bandwidth_hd_record = deque(maxlen=900)     # a deque of dicts, one dict per second, max 900 secs (= 15+ minutes)
    bandwidth_ld_record = deque(maxlen=1440)    # an increasing deque of dict; one dict per minute; max 24h
    minute_of_last_record = 0                   # flag to check if to add a new minute record to bandwidth_ld_record

    # TODO: Can this overflow?
    # bandwidth_total = {'up': 0, 'down': 0}      # all the data we've recorded are cumulated here;
    # bandwidth_total = {}

    basis_total_read = 0
    basis_total_written = 0
    bandwidth_total_read = 0
    bandwidth_total_written = 0

    bandwidth_total_count = 0

    _time = None

    # to ensure thread resistance
    hd_Lock = RLock()
    ld_Lock = RLock()

    def __init__(self, time_manager):
        self._time = time_manager
        self.record_bandwidth()     # record '0,0' a bit more than a minute ago to initialize

    def record_bandwidth(self, time_stamp=None, bytes_read=0, bytes_written=0, compensate_deviation=True):

        if time_stamp is None:
            time_stamp = time()

        if compensate_deviation is True:
            time_stamp = self._time(time_stamp)

        minute_of_current_record = floor(time_stamp / 60)   # minutes for LD
        js_time_stamp = int(time_stamp*1000)                # ms for JS!

        new_lbwnz = bytes_read > 0 or bytes_written > 0     # True if there's data to be recorded

        if new_lbwnz or self.last_bandwidth_not_zero:       # This ensures, that we're recording once '0,0' after data

            # statistical data
            self.bandwidth_total_read += bytes_read
            self.bandwidth_total_written += bytes_written
            self.bandwidth_total_count += 1

            #to prevent division by zero:
            if self.bandwidth_total_count == 0:
                self.bandwidth_total_count = 1

            # HD Data
            self.hd_Lock.acquire()
            self.bandwidth_hd_record.appendleft({'s': js_time_stamp,
                                                 'r': bytes_read,
                                                 'w': bytes_written,
                                                 'tr': self.basis_total_read + self.bandwidth_total_read,
                                                 'tw': self.basis_total_written + self.bandwidth_total_written,
                                                 'ar': self.bandwidth_total_read / self.bandwidth_total_count,
                                                 'aw': self.bandwidth_total_written / self.bandwidth_total_count
                                                 })
            self.hd_Lock.release()

            # # Total Count
            # if 's' in self.bandwidth_total:
            #     self.bandwidth_total['r'] = self.bandwidth_total.get('r', 0) + bytes_read
            #     self.bandwidth_total['w'] = self.bandwidth_total.get('w', 0) + bytes_written
            #     self.bandwidth_total_count += 1
            # else:
            #     self.bandwidth_total = {'s': time_stamp,        # 's' indicates since when we record data!
            #                             'r': bytes_read,
            #                             'w': bytes_written}
            #     self.bandwidth_total_count = 1

            # LD Data
            # check if we're still cumulating for the same minute
            self.ld_Lock.acquire()

            if self.minute_of_last_record == minute_of_current_record:
                # yes: cumulate!
                self.bandwidth_ld_record[0]['r'] += bytes_read
                self.bandwidth_ld_record[0]['w'] += bytes_written

                self.bandwidth_ld_record[0]['s'] = js_time_stamp
            else:
                # close the current record
                # => save current timestamp to indicate that something has changed
                if len(self.bandwidth_ld_record) > 0:
                    self.bandwidth_ld_record[0]['s'] = js_time_stamp

                # no: appendleft & init a new element to store the data for this new minute
                self.bandwidth_ld_record.appendleft({'s': js_time_stamp,
                                                     'm': minute_of_current_record * 60 * 1000,
                                                     'r': bytes_read,
                                                     'w': bytes_written})
                # molr keeps the minute we are cumulating data for!
                self.minute_of_last_record = minute_of_current_record

            self.ld_Lock.release()

        self.last_bandwidth_not_zero = new_lbwnz

    def get_data_hd(self, limit=None):
        # return HD Data; limit is in seconds
        self.hd_Lock.acquire()
        retval = list(itertools.islice(self.bandwidth_hd_record, 0, limit))
        self.hd_Lock.release()
        return retval

    def get_data_ld(self, limit=None):
        # return LD Data; limit is in minutes
        self.ld_Lock.acquire()
        retval = list(itertools.islice(self.bandwidth_ld_record, 0, limit))
        self.ld_Lock.release()
        return retval

    def get_data_hd_since(self, since_timestamp=None):
        # return HD Data; limit is a given timestamp
        if since_timestamp is None:
            return self.get_data_hd()
        else:
            self.hd_Lock.acquire()
            retval = list(itertools.takewhile(lambda x: x['s'] >= since_timestamp, self.bandwidth_hd_record))
            self.hd_Lock.release()
            return retval

    def get_data_ld_since(self, since_timestamp=None):
        # return LD Data; limit is a given timestamp
        if since_timestamp is None:
            return self.get_data_ld()
        else:
            self.ld_Lock.acquire()
            retval = list(itertools.takewhile(lambda x: x['s'] >= since_timestamp, self.bandwidth_ld_record))
            self.ld_Lock.release()
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

    def init_total_basis(self, bytes_read, bytes_written):
        self.basis_total_read = bytes_read
        self.basis_total_written = bytes_written
        self.bandwidth_total_read = 0
        self.bandwidth_total_written = 0
        self.bandwidth_total_count = 0
        return
