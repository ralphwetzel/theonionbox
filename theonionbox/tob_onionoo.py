import requests
from hashlib import sha1
from binascii import a2b_hex
from time import time, strptime
from calendar import timegm
# from tob_time import TimeManager

class OnionooManager(object):

    fingerprint = ''
    fp_hash = ''
    status = {}
    bw = {}
    _time = None
    _timestamp = None

    # https://onionoo.torproject.org/protocol.html#bandwidth
    history_object_keys = ['5_years', '1_year', '3_months', '1_month', '1_week', '3_days']
    result_object_keys = ['y5', 'y1', 'm3', 'm1', 'w1', 'd3']

    def __init__(self, time_manager):
        self._time = time_manager

    def query(self, fingerprint=None):

        if fingerprint:
            self.fingerprint = fingerprint
            # https://trac.torproject.org/projects/tor/ticket/6320
            self.fp_hash = sha1(a2b_hex(self.fingerprint)).hexdigest()

        if self.fingerprint:
            if self._query_details(self.fp_hash):
                if self._query_bandwidth(self.fp_hash):
                    self._timestamp = self._time()
                    return True

        return False

    def _query_details(self, hash):

        # to prevent accidental misuse ;)
        if not self.fingerprint:
            return False

        if not hash == self.fp_hash:
            return False

        payload = {'lookup': self.fp_hash}
        r = requests.get("https://onionoo.torproject.org/details", params=payload)

        if r.status_code != requests.codes.ok:
            return False

        j = r.json()
        if 'relays' in j:
            if len(j['relays']) == 1:
                if 'fingerprint' in j['relays'][0]:
                    if j['relays'][0]['fingerprint'] == self.fingerprint:
                        self.status = j['relays'][0]

        if j['bridges']:
            if len(j['bridges']) == 1:
                if 'hashed_fingerprint' in j['bridges'][0]:
                    if j['bridges'][0]['hashed_fingerprint'] == self.fp_hash:
                        self.status = j['bridges'][0]

        return True

    def get_details(self, datum):
        if datum in self.status:
            return self.status[datum]

    def get_bandwidth(self):
        return self.bw

    def get_bandwidth_keys(self):
        res = []
        for key in self.history_object_keys:
            if key in self.bw:
                res.append(key)

        return res

    def timestamp(self):
        return self._timestamp

    def _query_bandwidth(self, hash, since=None):

        # to prevent accidental misuse ;)
        if not self.fingerprint:
            return False

        if not hash == self.fp_hash:
            return False

        payload = {'lookup': self.fp_hash}
        r = requests.get("https://onionoo.torproject.org/bandwidth", params=payload)

        if r.status_code != requests.codes.ok:
            return False

        query_result = {}

        j = {}
        try:
            j = r.json()
        except:
            pass

        if 'relays' in j:
            if len(j['relays']) == 1:
                if 'fingerprint' in j['relays'][0]:
                    if j['relays'][0]['fingerprint'] == self.fingerprint:
                        query_result = j['relays'][0]

        if 'bridges' in j:
            if len(j['bridges']) == 1:
                if 'hashed_fingerprint' in j['bridges'][0]:
                    if j['bridges'][0]['fingerprint'] == self.fp_hash:
                        query_result = j['bridges'][0]

        if not query_result:
            return False

        self.bw = {}

        if 'write_history' in query_result:
            wh = query_result['write_history']

            process_ho_index = self._get_first_available_history_object_key_index(wh)

            while process_ho_index is not None:

                result = []
                process_ho = wh[self.history_object_keys[process_ho_index]]

                data = process_ho['values']
                data_index = 0
                data_count = process_ho['count']
                data_interval = process_ho['interval']
                data_factor = process_ho['factor']

                utc_timestruct = strptime(process_ho['first'], '%Y-%m-%d %H:%M:%S')
                data_timestamp = timegm(utc_timestruct)

                # to ensure the charts look nice #1
                result.append([(data_timestamp - data_interval) * 1000, 0])

                while data_index < data_count:
                    result.append([data_timestamp * 1000, int(data[data_index]*data_factor)])
                    data_index += 1
                    data_timestamp += data_interval

                # to ensure the charts look nice #2
                result.append([data_timestamp * 1000, 0])

                if not self.result_object_keys[process_ho_index] in self.bw:
                    self.bw[self.result_object_keys[process_ho_index]] = {}

                self.bw[self.result_object_keys[process_ho_index]]['wh'] = result
                process_ho_index = self._get_next_available_history_object_key_index(wh, process_ho_index)

        if 'read_history' in query_result:
            rh = query_result['read_history']

            process_ho_index = self._get_first_available_history_object_key_index(rh)

            while process_ho_index is not None:

                result = []
                process_ho = rh[self.history_object_keys[process_ho_index]]

                data = process_ho['values']
                data_index = 0
                data_count = process_ho['count']
                data_interval = process_ho['interval']
                data_factor = process_ho['factor']

                utc_timestruct = strptime(process_ho['first'], '%Y-%m-%d %H:%M:%S')
                data_timestamp = timegm(utc_timestruct)

                # to ensure the charts look nice #1
                result.append([(data_timestamp - data_interval) * 1000, 0])

                import datetime

                while data_index < data_count:
                    # print(datetime.datetime.fromtimestamp(data_timestamp).strftime('%Y-%m-%d %H:%M:%S'))
                    result.append([data_timestamp * 1000, int(data[data_index]*data_factor)])
                    data_index += 1
                    data_timestamp += data_interval

                # to ensure the charts look nice #2
                result.append([data_timestamp * 1000, 0])

                if not self.result_object_keys[process_ho_index] in self.bw:
                    self.bw[self.result_object_keys[process_ho_index]] = {}

                self.bw[self.result_object_keys[process_ho_index]]['rh'] = result
                process_ho_index = self._get_next_available_history_object_key_index(rh, process_ho_index)

        return True

    def _get_first_available_history_object_key_index(self, history_objects):
        return self._get_next_available_history_object_key_index(history_objects)

    def _get_next_available_history_object_key_index(self, history_objects, current_key_index = None):

        if current_key_index is None:
            check_index = -1
        elif (current_key_index < -1) or not (current_key_index < len(self.history_object_keys )):
            return False
        else:
            check_index = current_key_index

        found = None
        while not found:

            check_index += 1
            if not check_index < len(self.history_object_keys):
                break

            if self.history_object_keys[check_index] in history_objects:
                found = check_index

        # print("found: {}".format(found))
        return found


