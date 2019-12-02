from time import time
from collections import deque
# from math import floor
import itertools
# from tob_time import TimeManager
from threading import RLock
from tob.deviation import getTimer
import logging
from .recorder import Recorder
from persistor import BandwidthPersistor

from sqlite3 import Row, Connection
from typing import Optional, List, Dict

import math

# class tob_list(list):
#
#     def append(self, p_object):
#         list.append(self, p_object)

intervals = {
    '1s': 1,         # 1 second
    '1m': 60,  # interval: 1 minute
    # 'Fm': 60 * 15,  # 15 minutes - to generate "3 days" graph - 'x0F' = 15
    '5m': 60 * 5, # replacing 'Fm' for better visualisation!
    '1h': 60 * 60,  # 60 minutes - to generate "1 week" graph
    '4h': 60 * 60 * 4,  # 4 hours - to generate "1 month" graph
    'Ch': 60 * 60 * 12,  # 12 hours - to generate "3 month" graph - 'x0C' = 12
}


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

    persistor = None

    def __init__(self, persistor: BandwidthPersistor):

        log = logging.getLogger('theonionbox')
        log.debug('Creating LiveDataManager...')

        self.persistor = persistor

        # intervals = {
        #     # '1s': 1,         # 1 second
        #     '1m': 60,        # interval: 1 minute
        #     'Fm': 60*15,     # 15 minutes - to generate "3 days" graph - 'x0F' = 15
        #     '1h': 60*60,     # 60 minutes - to generate "1 week" graph
        #     '4h': 60*60*4,   # 4 hours - to generate "1 month" graph
        #     'Ch': 60*60*12,  # 12 hours - to generate "3 month" graph - 'x0C' = 12
        # }

        timer = getTimer()
        time_stamp = int(timer.compensate(time())*1000) # ms for JS!

        maxlen = 1500
        self.bandwidths = {}
        self.recorders = {}

        # this is a generator to transform sqlite3.row in to pure dict.
        # at the same time, we reverse the order of the items for the resulting deque.
        def row_to_dict(data: List[Row]):
            try:
                while 1:
                    row = data.pop()
                    if len(row) > 0:
                        out = {}
                        for key in row.keys():
                            out[key] = row[key]
                        yield out
                    else:
                        pass
            except IndexError:
                pass

        conn = self.persistor.open_connection()

        for key, interval in intervals.items():
            # a deque of dicts, one dict per interval, max 1500 items
            # self.bandwidths[key] = deque(maxlen=maxlen)

            # but not for '1s': to be handled separately (below)
            if key == '1s':
                continue

            # (Bandwidth)Persistor returns the items in exactly the format we need to feed them into the deque...
            # ... yet the order is "newest first" -> "oldest last" and it's stucked into a sqlite3.Row
            # With the generator 'row_to_dict' we feed it into the deque in the correct form.
            init_data = self.persistor.get(interval=key, js_timestamp=time_stamp, limit=maxlen, connection=conn) or []

            if len(init_data) > 0:
                self.bandwidths[key] = deque(row_to_dict(init_data), maxlen=maxlen)
            else:
                self.bandwidths[key] = deque(maxlen=maxlen)

            # print (self.bandwidths[key])

            # take the latest entry to initialize the recorders
            try:
                latest_entry = self.bandwidths[key].pop()
                self.recorders[key] = Recorder(interval=interval,
                                               timestamp=latest_entry['m'] / 1000,  # ms -> s
                                               read=latest_entry['r'],
                                               write=latest_entry['w'],
                                               )
            except IndexError:
                # No entry -> init with one data point one 'interval' slot in the past.
                # This will create a good starting point!
                ### 20180215: Necessary?
                # self.recorders[key] = Recorder(interval=interval,
                #                                timestamp=time() - interval,
                #                                read=0,
                #                                write=0,
                #                                )

                self.recorders[key] = Recorder(interval=interval)

        # a deque of dicts, one dict per second, max 1500 secs (= 25 minutes)
        self.bandwidths['1s'] = deque(maxlen=1500)

        self.bandwidth_total_read = 0
        self.bandwidth_total_written = 0

        # to ensure thread resistance
        self.live_Lock = RLock()

        # record '0,0' a minute ago to initialize
        self.last_bandwidth_not_zero = True
        # self.record_bandwidth(time_stamp=time() - 60, connection=conn)

        if conn is not None:
            # conn.commit()
            conn.close()

    def record_bandwidth(self, time_stamp: Optional[float] = None, bytes_read: Optional[int] = 0,
                         bytes_written: Optional[int] = 0, compensate_deviation: Optional[bool] = True,
                         connection: Optional[Connection] = None) -> Connection:

        # This returns the used (or generated) sqlite3.Connection object!

        timer = getTimer()

        if time_stamp is None:
            time_stamp = time()

        if compensate_deviation is True:
            time_stamp = timer.compensate(time_stamp)

        # Javascript timestamp
        js_time_stamp = int(time_stamp * 1000)          # ms for JS!
        # js_time_stamp = math.floor(time_stamp) * 1000   # ms for JS!
        # print(time_stamp, js_time_stamp)

        new_lbwnz = bytes_read > 0 or bytes_written > 0     # True if there's data to be recorded

        conn = connection
        if new_lbwnz or self.last_bandwidth_not_zero:       # This ensures, that we're recording once '0,0' after data

            # total counting data
            self.bandwidth_total_read += bytes_read
            self.bandwidth_total_written += bytes_written

            # bytes_read == download => < 0
            bytes_read = -int(bytes_read)
            bytes_written = int(bytes_written)

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
                                                 write=bytes_written)
                if rec is not None:

                    if conn is None:
                        conn = self.persistor.open_connection()

                    interval = self.recorders[key].get_interval()
                    new_slot_start = self.recorders[key].get_slot_start()
                    rec_slot_start = rec['timestamp']

                    # insert the finalised record
                    self._persist_and_append(interval=key,
                                             js_timestamp=js_time_stamp,
                                             slot=rec_slot_start,
                                             read=rec.get('read', 0),
                                             write=rec.get('write', 0),
                                             connection=conn)

                    # check for continuity of records:
                    slot_delta = int((new_slot_start - rec_slot_start) / interval)
                    
                    if slot_delta > 2:
                        # rec ... * ... [*.*] ... * ... new
                        # => add 2 empty recordings,thereof the first after rec
                        # the second one will be appended below!
                        self._persist_and_append(interval=key,
                                                 js_timestamp=js_time_stamp,
                                                 slot=(rec_slot_start + interval),
                                                 read=0,
                                                 write=0,
                                                 connection=conn)

                    if slot_delta > 1:
                        # rec ... * ... new
                        # => add 1 empty recording, immediately before new
                        self._persist_and_append(interval=key,
                                                 js_timestamp=js_time_stamp,
                                                 slot=(new_slot_start - interval),
                                                 read=0,
                                                 write=0,
                                                 connection=conn)

            self.live_Lock.release()

        self.last_bandwidth_not_zero = new_lbwnz
        return conn

    def _persist_and_append(self, interval: str, js_timestamp: int, slot: int,
                            read: Optional[int] = 0, write: Optional[int] = 0, connection: Optional[Connection] = None):

        # print("interval: {} - slot: {} - read: {} - write: {}".format(interval, slot, read, write))

        self.persistor.persist(interval=interval, timestamp=slot, read=read, write=write, connection=connection)

        self.bandwidths[interval].append({'s': js_timestamp,
                                          'm': slot * 1000,  # Javascript timestamp
                                          'r': read,
                                          'w': write,
                                          })

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

    def get_data(self, interval: Optional[str] = '1s',
                 since_timestamp: Optional[float] = None, limit: Optional[int] = None) -> List[Dict[str, int]]:

        # This could raise a KeyError, if wrong 'interval' used.
        # This is done by intension!
        bw = self.bandwidths[interval]

        # print('len(bw): {}'.format(len(bw)))

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

    def set_traffic(self, traffic_read: int, traffic_written: int):

        self.bandwidth_total_read = traffic_read
        self.bandwidth_total_written = traffic_written

    # def get_persistor_path(self):
    #     if self.persistor is not None:
    #         return self.persistor

    def shutdown(self):

        try:
            conn = self.persistor.open_connection()

            for key in self.recorders:
                self.persistor.persist(interval=key,
                                       timestamp=self.recorders[key].get_slot_start(),
                                       read=self.recorders[key].get('read'),
                                       write=self.recorders[key].get('write'),
                                       connection=conn
                                       )
            conn.commit()
            conn.close()
        except:
            pass

