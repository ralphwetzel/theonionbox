from __future__ import absolute_import

import requests
from hashlib import sha1
from binascii import a2b_hex
from time import strptime
from calendar import timegm
import logging
import sys

from concurrent.futures import ThreadPoolExecutor

#####
# Python version detection
py = sys.version_info
py30 = py >= (3, 0, 0)

__supported_protocol__ = '3.1'


class Query(object):

    def __init__(self, fingerprint):
        self.ifModSince = ''
        self.data = None
        self.fingerprint = fingerprint
        self.address = None
        self.query_callback = None

        # https://trac.torproject.org/projects/tor/ticket/6320
        self.hash = sha1(a2b_hex(fingerprint)).hexdigest()

    def query(self, address, callback=None):

        self.address = address
        if callback is None:
            callback = self._noop
        self.query_callback = callback

        payload = {'lookup': self.hash}
        headers = {'accept-encoding': 'gzip'}
        if len(self.ifModSince) > 0:
            headers['if-modified-since'] = self.ifModSince

        executor = ThreadPoolExecutor(max_workers=5)

        lgr = logging.getLogger('theonionbox')
        lgr.debug("Onionoo: Launching query of '{}'.".format(address))

        future = executor.submit(requests.get, address, params=payload)
        future.add_done_callback(self._process)

    def _noop(self, success):
        return

    def _process(self, future):

        lgr = logging.getLogger('theonionbox')

        r = None
        try:
            r = future.result()
        except Exception as exc:
            lgr.info("Onionoo: Failed to query '{}': {}".format(self.address, exc))
            return self.query_callback(False)
        else:
            lgr.debug("Onionoo: Finished querying '{}' with status code {}.".format(self.address, r.status_code))

        if r is None:
            return self.query_callback(False)

        if r.status_code != requests.codes.ok:
            return self.query_callback(False)

        self.ifModSince = r.headers['last-modified']
        if r.status_code == requests.codes.not_modified:
            return self.query_callback(True)

        try:
            data = r.json()
        except Exception as exc:
            lgr.debug("Onionoo: Failed to un-json network data; error code says '{}'.".format(exc))
            return self.query_callback(False)

        self.data = data
        return self.query_callback(True)


class Document(object):

    history_object_keys = ['5_years', '1_year', '3_months', '1_month', '1_week', '3_days']
    # result_object_keys = ['y5', 'y1', 'm3', 'm1', 'w1', 'd3']

    result_object_keys = {'5_years': 'y5',
                          '1_year':'y1',
                          '3_months': 'm3',
                          '1_month': 'm1',
                          '1_week': 'w1',
                          '3_days': 'd3'}

    _query_callback = None
    oo_query = None

    none_value = -10    # '-10' to distinguish None from 0 (zero)

    def __init__(self):
        # self.oo_query = Query(fingerprint)
        self._is_relay = None
        self._is_bridge = None
        self.data = None

    def hash(self, fingerprint):
        # https://trac.torproject.org/projects/tor/ticket/6320
        return sha1(a2b_hex(fingerprint)).hexdigest()

    def query(self, fingerprint, address, callback=None):

        if self.oo_query is not None:
            if self.oo_query.fingerprint != fingerprint:
                self.oo_query = None

        if self.oo_query is None:
            self.oo_query = Query(fingerprint)

        self._query_callback = callback
        return self.oo_query.query(address, self._done)

    def _done(self, success):

        if success is False:
            return self._query_callback(success)

        lgr = logging.getLogger('theonionbox')

        self.data = self.oo_query.data
        self._is_relay = None
        self._is_bridge = None

        v = self.version()
        if v != __supported_protocol__:
            lgr.warn("Onionoo protocol version mismatch! Supported: {} | Received: {}."
                     .format(__supported_protocol__, v))

        if self.is_relay() == self.is_bridge() is True:
            lgr.warn("Onionoo protocol error! Fingerprint '{}' returns data for 'Relay' AND for 'Bridge'!"
                     .format(self.oo_query.fingerprint))

        return self._query_callback(True)

    def _get(self, datum):
        return self.data[datum] if datum in self.data else None

    def version(self):
        return self._get('version')

    def next_major_version_scheduled(self):
        return self._get('next_major_version_scheduled')

    def relays_published(self):
        return self._get('relays_published')

    def relays(self):
        rlys = self._get('relays')
        if rlys is None:
            return None
        if len(rlys) > 0:
            return rlys[0]
        return None

    def bridges_published(self):
        return self._get('bridges_published')

    def bridges(self):
        brdgs = self._get('bridges')
        if brdgs is None:
            return None
        if len(brdgs) > 0:
            return brdgs[0]
        return None

    def is_relay(self):
        if self.data is None:
            return None
        if self._is_relay is None:
            rlys = self.relays()
            if rlys is not None:
                self._is_relay = True
            else:
                self._is_relay = False
        return self._is_relay

    def is_bridge(self):
        if self.data is None:
            return None
        if self._is_bridge is None:
            brdg = self.bridges()
            if brdg is not None:
                self._is_bridge = True
            else:
                self._is_bridge = False
        return self._is_bridge

    def published(self):
        if self.is_relay():
            return self.relays_published()
        elif self.is_bridge():
            return self.bridges_published()
        else:
            return None

    def _decode_history_object(self, data, name, key):
        if data is None:
            return None

        if name not in data:
            KeyError("No History Object named '{}' in chart data.".format(name))

        hist_obj = data[name]

        if key not in hist_obj:
            return None

        # go = graph objext
        go = hist_obj[key]
        result = []

        data = go['values']
        data_index = 0
        data_count = go['count']
        data_interval = go['interval']
        data_factor = go['factor']

        utc_timestruct = strptime(go['first'], '%Y-%m-%d %H:%M:%S')
        data_timestamp = timegm(utc_timestruct)

        while data_index < data_count:
            value = data[data_index]
            if value is None:
                # result.append([data_timestamp * 1000, None])
                result.append([data_timestamp * 1000, self.none_value])
            else:
                result.append([data_timestamp * 1000, value * data_factor])

            data_index += 1
            data_timestamp += data_interval

        result.append([data_timestamp * 1000, 0])
        return result

    def get_chart(self, data, chart, period=None, cache=None):

        keys = self.history_object_keys
        if period is not None:
            if period not in keys:
                raise KeyError("'{}' is not a valid History Object Key.".format(period))
            else:
                keys = [period]

        result = {}
        for key in keys:
            k = self.result_object_keys[key]

            if cache is not None and k in cache:
                hist_obj = cache[k]
            else:
                hist_obj = self._decode_history_object(data, chart, key)

                if cache and hist_obj:
                    cache[k] = hist_obj

            if hist_obj:
                result[k] = hist_obj

        return result if len(result) > 0 else None

    def has_data(self):
        raise NotImplementedError("Please provide a custom 'has_data' function when overwriting 'Document'.")


class Details(Document):

    # onionoo protocol v3.1
    relay_detail = {
        'nickname': 'Unnamed',
        'fingerprint': '',
        'or_addresses': [''],
        'exit_addresses': None,
        'dir_address': None,
        'last_seen': '',
        'last_changed_address_or_port': '',
        'first_seen': '',
        'running': False,
        'hibernating': None,
        'flags': None,
        'country': None,
        'country_name': None,
        'region_name': None,
        'city_name': None,
        'latitude': None,
        'longitude': None,
        'as_number': None,
        'consensus_weight': 0,
        'host_name': None,
        'last_restarted': None,
        'bandwidth_rate': None,
        'bandwidth_burst': None,
        'observed_bandwidth': None,
        'advertised_bandwidth': None,
        'exit_policy': None,
        'exit_policy_summary': None,
        'exit_policy_v6_summary': None,
        'contact': None,
        'platform': None,
        'recommended_version': None,
        'effective_family': None,
        'alleged_family': None,
        'indirect_family': None,
        'consensus_weight_fraction': None,
        'guard_probability': None,
        'middle_probability': None,
        'exit_probability': None,
        'measured': None
    }

    # onionoo protocol v3.1
    bridge_detail = {
        'nickname': 'Unnamed',
        'hashed_fingerprint': '',
        'or_adresses': [''],
        # 'exit_adresses': None,
        # 'dir_adress': None,
        'last_seen': '',
        # 'last_changed_address_or_port': '',
        'first_seen': '',
        'running': False,
        # 'hibernating': None,
        'flags': None,
        # 'country': None,
        # 'country_name': None,
        # 'region_name': None,
        # 'city_name': None,
        # 'latitude': None,
        # 'longitude': None,
        # 'as_number': None,
        # 'consensus_weight': 0,
        # 'host_name': None,
        'last_restarted': None,
        # 'bandwidth_rate': None,
        # 'bandwidth_burst': None,
        # 'observed_bandwidth': None,
        'advertised_bandwidth': None,
        # 'exit_policy': None,
        # 'exit_policy_summary': None,
        # 'exit_policy_v6_summary': None,
        # 'contact': None,
        'platform': None,
        # 'recommended_version': None,
        # 'effective_family': None,
        # 'alleged_family': None,
        # 'indirect_family': None,
        # 'consensus_weight_fraction': None,
        # 'guard_probability': None,
        # 'middle_probability': None,
        # 'exit_probability': None,
        # 'measured': None
        'transports': None
    }

    def __init__(self):
        self.detail_data = None
        Document.__init__(self)

    def refresh(self, fingerprint):

        self.query(fingerprint, 'https://onionoo.torproject.org/details', self._refresh_callback)

    def _refresh_callback(self, success):

        if success is False:
            # self.detail_data = None
            return

        if self.is_relay():
            self.detail_data = self.relays()
        elif self.is_bridge():
            self.detail_data = self.bridges()
        else:
            self.detail_data = None

    def __call__(self, detail):

        if self.has_data() is False:
            if detail in self.relay_detail:
                return self.relay_detail[detail]
            else:
                return None

        if self.is_relay():
            if detail in self.detail_data:
                return self.detail_data[detail]
            elif detail in self.relay_detail:
                return self.relay_detail[detail]
            else:
                return None

        if self.is_bridge():
            if detail in self.detail_data:
                return self.detail_data[detail]
            elif detail in self.bridge_detail:
                return self.bridge_detail[detail]
            else:
                return None

        return None

    def has_data(self):
        return self.detail_data is not None


class Bandwidth(Document):

    bw_data = None
    read_cache = {}
    write_cache = {}

    def __init__(self):
        self.read_cache = {}
        self.write_cache = {}
        self.bw_data = None
        Document.__init__(self)

    def refresh(self, fingerprint):

        self.query(fingerprint, 'https://onionoo.torproject.org/bandwidth', self._refresh_callback)

    def _refresh_callback(self, success):

        if success is False:
            # self.bw_data = {}
            return

        self.read_cache = {}
        self.write_cache = {}

        if self.is_relay():
            self.bw_data = self.relays()
        elif self.is_bridge():
            self.bw_data = self.bridges()
        else:
            self.bw_data = None

    def read(self, period=None):

        if self.has_data() is False:
            return None

        return self.get_chart(self.bw_data, 'read_history', period, self.read_cache)

    def write(self, period=None):

        if self.has_data() is False:
            return None

        return self.get_chart(self.bw_data, 'write_history', period, self.write_cache)

    def has_data(self):
        return self.bw_data is not None


class Weights(Document):

    weights_data = None
    cwf_cache = {}      # consensus_weight_fraction
    guard_cache = {}    # guard_probability
    middle_cache = {}   # middle_probability
    exit_cache = {}     # exit_probability
    cw_cache = {}       # consensus_weight

    def __init__(self):
        self.cwf_cache = {}  # consensus_weight_fraction
        self.guard_cache = {}  # guard_probability
        self.middle_cache = {}  # middle_probability
        self.exit_cache = {}  # exit_probability
        self.cw_cache = {}  # consensus_weight
        Document.__init__(self)
        self.none_value = None

    def refresh(self, fingerprint):

        self.query(fingerprint, 'https://onionoo.torproject.org/weights', self._refresh_callback)

    def _refresh_callback(self, success):

        if success is False:
            # self.bw_data = {}
            return

        self.cwf_cache = {}  # consensus_weight_fraction
        self.guard_cache = {}  # guard_probability
        self.middle_cache = {}  # middle_probability
        self.exit_cache = {}  # exit_probability
        self.cw_cache = {}  # consensus_weight

        if self.is_relay():
            self.weights_data = self.relays()
        elif self.is_bridge():
            self.weights_data = self.bridges()
        else:
            self.weights_data = None

    def consensus_weight_fraction(self, period=None):
        if self.has_data() is False:
            return None
        return self.get_chart(self.weights_data, 'consensus_weight_fraction', period, self.cwf_cache)

    def guard_probability(self, period=None):
        if self.has_data() is False:
            return None
        return self.get_chart(self.weights_data, 'guard_probability', period, self.guard_cache)

    def middle_probability(self, period=None):
        if self.has_data() is False:
            return None
        return self.get_chart(self.weights_data, 'middle_probability', period, self.middle_cache)

    def exit_probability(self, period=None):
        if self.has_data() is False:
            return None
        return self.get_chart(self.weights_data, 'exit_probability', period, self.exit_cache)

    def consensus_weight(self, period=None):
        if self.has_data() is False:
            return None
        return self.get_chart(self.weights_data, 'consensus_weight', period, self.cw_cache)

    def has_data(self):
        return self.weights_data is not None
