from time import time
from collections import deque
from math import floor
import itertools
# from tob_time import TimeManager
from threading import RLock
import tob_time

class tob_list(list):

    def append(self, p_object):
        list.append(self, p_object)


class LiveDataManager(object):

    # this flag is to ensure that at least once '0/0' is recorded
    # into the records after 'relevant' data was received
    # this is to make our charts look great!
    last_bandwidth_not_zero = True

    bandwidth_hd_record = deque(maxlen=900)     # a deque of dicts, one dict per second, max 900 secs (= 15+ minutes)
    bandwidth_ld_record = deque(maxlen=1440)    # an increasing deque of dict; one dict per minute; max 24h

    minute_of_last_record = 0                   # flag to check if to add a new minute record to bandwidth_ld_record

#    bandwidth_history_read = deque()    # a deque of arrays; one array per day; unlimited
#    bandwidth_history_write = deque()   # a deque of arrays; one array per day; unlimited
#    history_hour = 0                    # this is the hour we're just recording for the history
#    bandwidth_history_today = []        #

    # TODO: Can this overflow?
    # bandwidth_total = {'up': 0, 'down': 0}      # all the data we've recorded are cumulated here;
    # bandwidth_total = {}

    basis_total_read = 0
    basis_total_written = 0
    bandwidth_total_read = 0
    bandwidth_total_written = 0

    bandwidth_total_count = 0

    # to ensure thread resistance
    hd_Lock = RLock()
    ld_Lock = RLock()

    def __init__(self):
        self.record_bandwidth()     # record '0,0' a bit more than a minute ago to initialize

    def record_bandwidth(self, time_stamp=None, bytes_read=0, bytes_written=0, compensate_deviation=True):

        timer = tob_time.getTimer()

        if time_stamp is None:
            time_stamp = time()

        if compensate_deviation is True:
            time_stamp = timer.compensate(time_stamp)

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
            self.bandwidth_hd_record.append({'s': js_time_stamp,
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
                self.bandwidth_ld_record.append({'s': js_time_stamp,
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
        length = len(self.bandwidth_hd_record)
        if limit is None or length <= limit:
            retval = list(self.bandwidth_hd_record)
        else:
            retval = list(itertools.islice(self.bandwidth_hd_record, length - limit, limit))
        self.hd_Lock.release()
        return retval

    def get_data_ld(self, limit=None):
        # return LD Data; limit is in minutes
        self.ld_Lock.acquire()
        length = len(self.bandwidth_ld_record)
        if limit is None or length <= limit:
            retval = list(self.bandwidth_ld_record)
        else:
            retval = list(itertools.islice(self.bandwidth_ld_record, length - limit, limit))
        self.ld_Lock.release()
        return retval

    def get_data_hd_since(self, since_timestamp=None):
        # return HD Data; limit is a given timestamp
        if since_timestamp is None:
            return self.get_data_hd()
        else:
            self.hd_Lock.acquire()
            retval = list(itertools.dropwhile(lambda x: x['s'] < since_timestamp, self.bandwidth_hd_record))
            self.hd_Lock.release()
            return retval

    def get_data_ld_since(self, since_timestamp=None):
        # return LD Data; limit is a given timestamp
        if since_timestamp is None:
            return self.get_data_ld()
        else:
            self.ld_Lock.acquire()
            retval = list(itertools.dropwhile(lambda x: x['s'] < since_timestamp, self.bandwidth_ld_record))
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

    # def init_total_basis(self, bytes_read, bytes_written):
    #     self.basis_total_read = bytes_read
    #     self.basis_total_written = bytes_written
    #     self.bandwidth_total_read = 0
    #     self.bandwidth_total_written = 0
    #     self.bandwidth_total_count = 0
    #     return

import logging

class Cumulator(object):

    values = {}
    interval_start = 0
    baskets = {}
    count = 0

    max_count = 500
    interval = 0
    interval_js = 0

    changed = False

    def __init__(self, interval, initial_status=None, max_count=None):

        self.interval = int(interval)
        self.interval_js = int(interval * 1000)

        if max_count is not None:
            self.max_count = max_count

        timestamp = tob_time.getTimer().time()

        self.values = {}
        self.baskets = {}
        self.interval_start = 0
        self.count = 0

        self.interval_start = int(floor(timestamp / self.interval))

        # initialize with saved status (if provided)
        if initial_status is not None:
            if 'v' in initial_status:
                self.values = initial_status['v']
            if 'cis' in initial_status:
                self.interval_start = int(initial_status['cis'])
                if 'cbc' in initial_status:
                    self.count = initial_status['cbc']
                    if 'ccb' in initial_status:
                        self.baskets = initial_status['ccb']

            now_interval = int(floor(timestamp / self.interval))
            if self.interval_start > now_interval:
                # this shall never happen!
                lgr = logging.getLogger('theonionbox')
                lgr.warn("Cumulator {}: Data used to initialize seems to be corrupt!".format(interval))
            elif self.interval_start < now_interval - 1:
                # if the status' interval_start is in the past (more than one step)
                # cumulate one entry @ interval_start + 1
                # to close the running cumulation and record then a 'none' interval
                self.cumulate(timestamp=(self.interval_start + 1) * self.interval)

#        else:
#            self.events.info('Cumulator {}: Protocol version used for initialisation == {};'
#                             ' Not supported! Must be == 1'.format(interval, initial_status['protocol']))
        self.changed = True

    def get_values(self, only_if_changed=False):
        if only_if_changed is True and self.changed is False:
            return None

        self.changed = False
        return self.values

    def get_changed(self):
        return self.changed

    def get_status(self):

        status = {'v': self.values,             # { 'keya': [ [timestamp1, avg_a], [timestamp2, avg_a], ... ],
                                                #   'keyb': [ [timestamp1, avg_b], [timestamp2, avg_b], ... ],
                                                #   ...
                                                # }
                  'cis': self.interval_start,
                  'ccb': self.baskets,          # { 'keya': value_a, 'keyb': value_b}
                  'cbc': self.count}
        return status

    def cumulate(self, timestamp=None, **kwargs):

        timestamp = tob_time.getTimer().compensate(timestamp)

        if len(kwargs) == 0:
            size = len(self.values)
            if size == 0:
                return False
            else:
                # kargs = {}
                for key, value in self.values.items():
                    kwargs[key] = 0

        if self.interval_start == int(floor(timestamp / self.interval)):

            # enumerating over the given arguments
            for key, value in kwargs.items():

                # to ensure the list grows as necessary
                if key not in self.baskets:
                    self.baskets[key] = 0

                # add to the baskets based on index
                self.baskets[key] += value    # could this overflow?

            self.count += 1
        else:

            # close and record the current baskets, open new ones
            for key, basket in self.baskets.items():

                # this mimics the onionoo behaviour:
                # https://onionoo.torproject.org/protocol.html#bandwidth
                # cum_res = int(basket / self.interval) if (self.count / self.interval) > 0.2 else None
                cum_res = int(basket / self.interval)

                # to ensure the list of results grows as necessary
                if key not in self.values:
                    init_timestamp = int((self.interval_start - 1) * self.interval_js)
                    self.values[key] = [[init_timestamp, 0]]

                # result will be a list [timestamp, cumulated_average] for each basket in baskets
                self.values[key].append([int(self.interval_start * self.interval_js), cum_res])

                if self.max_count is not None:
                    self.values[key] = self.values[key][:self.max_count]

            self.interval_start = int(floor(timestamp / self.interval))
            self.baskets = kwargs
            self.count = 1
            self.changed = True
