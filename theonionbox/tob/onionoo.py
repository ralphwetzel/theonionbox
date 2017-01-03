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


class Mode(object):
    OPEN = 0
    TOR = 1
    HIDDEN = 2

class TorType(object):
    RELAY = 0
    BRIDGE = 1

ONIONOO_OPEN = 'https://onionoo.torproject.org'
# ONIONOO_HIDDEN = 'http://onionoorcazzotwa.onion'
ONIONOO_HIDDEN = 'http://tgel7v4rpcllsrk2.onion'


# class Query(object):
#
#     def __init__(self, fingerprint, mode=Mode.OPEN, proxy=None):
#         self.ifModSince = ''
#         self.data = None
#         self.fingerprint = fingerprint
#         self.address = None
#         self.query_callback = None
#         self.mode = mode
#         self.proxy = proxy
#
#         # https://trac.torproject.org/projects/tor/ticket/6320
#         self.hash = sha1(a2b_hex(fingerprint)).hexdigest()
#
#     def query(self, address, callback=None):
#
#         self.address = address
#         if callback is None:
#             callback = self._noop
#         self.query_callback = callback
#
#         payload = {'lookup': self.hash}
#         headers = {'accept-encoding': 'gzip'}
#         if len(self.ifModSince) > 0:
#             headers['if-modified-since'] = self.ifModSince
#
#         proxies = {}
#         if self.proxy is not None:
#             if self.mode == Mode.TOR or self.mode == Mode.HIDDEN:
#                 proxies = {
#                     'http': 'socks5://' + self.proxy,
#                     'https': 'socks5://' + self.proxy
#                 }
#
#         executor = ThreadPoolExecutor(max_workers=5)
#
#         lgr = logging.getLogger('theonionbox')
#         lgr.debug("Onionoo: Launching query of '{}'.".format(address))
#
#         future = executor.submit(requests.get, address, params=payload, headers=headers, proxies=proxies)
#         future.add_done_callback(self._process)
#
#     def _noop(self, success):
#         return
#
#     def _process(self, future):
#
#         lgr = logging.getLogger('theonionbox')
#
#         r = None
#         try:
#             r = future.result()
#         except Exception as exc:
#             lgr.info("Onionoo: Failed to query '{}': {}".format(self.address, exc))
#             return self.query_callback(False)
#         else:
#             lgr.debug("Onionoo: Finished querying '{}' with status code {}.".format(self.address, r.status_code))
#
#         if r is None:
#             return self.query_callback(False)
#
#         if r.status_code != requests.codes.ok:
#             return self.query_callback(False)
#
#         self.ifModSince = r.headers['last-modified']
#         if r.status_code == requests.codes.not_modified:
#             return self.query_callback(True)
#
#         try:
#             data = r.json()
#         except Exception as exc:
#             lgr.debug("Onionoo: Failed to un-json network data; error code says '{}'.".format(exc))
#             return self.query_callback(False)
#
#         self.data = data
#         return self.query_callback(True)


class Document(object):

    history_object_keys = ['5_years', '1_year', '3_months', '1_month', '1_week', '3_days']
    # result_object_keys = ['y5', 'y1', 'm3', 'm1', 'w1', 'd3']

    result_object_keys = {'5_years': 'y5',
                          '1_year':'y1',
                          '3_months': 'm3',
                          '1_month': 'm1',
                          '1_week': 'w1',
                          '3_days': 'd3'}

    none_value = -10    # '-10' to distinguish None from 0 (zero)

    cache = {}
    ifModSince = ''

    def __init__(self):
        # self.oo_query = Query(fingerprint)
        self._is_relay = None
        self._is_bridge = None
        self.document_data = None
        self.object_data = None
        self.cache = {}
        self.ifModSince = ''
        self.log = logging.getLogger('theonionbox')

    def update(self, data):

        self.document_data = data
        self.object_data = None
        self.cache = {}

        if data is None:
            return

        v = self.version()
        if v != __supported_protocol__:
            # lgr.warn("Onionoo protocol version mismatch! Supported: {} | Received: {}."
            #         .format(__supported_protocol__, v))
            self.update(None)
            return

        rlys = self.relays()
        brdgs = self.bridges()

        if rlys is not None and brdgs is not None:
            # lgr.warn("Onionoo protocol error! Fingerprint '{}' returns data for 'Relay' AND for 'Bridge'!"
            #          .format(self.oo_query.fingerprint))
            self.update(None)
            return
        elif rlys is not None:
            self._is_relay = True
            self.object_data = rlys
        elif brdgs is not None:
            self._is_bridge = True
            self.object_data = brdgs

        return

    def _get(self, datum):
        return self.document_data[datum] if datum in self.document_data else None

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
        return self._is_relay

    def is_bridge(self):
        return self._is_bridge

    def published(self):
        if self.is_relay():
            return self.relays_published()
        elif self.is_bridge():
            return self.bridges_published()
        else:
            return None

    def _decode_history_object(self, name, key):

        self.log.debug('({}, {})'.format(name, key))

        if self.object_data is None:
            return None

        # lgr = logging.getLogger('theonionbox')

        try:
            hist_obj = self.object_data[name]
        except Exception:
            # This Exception will be raised if a wrong 'name' was provided while programming
            # OR if the relay is so young that there are no historical infos in the onionoo data!
            self.log.warn("While decoding Onionoo history data: Key '{}' not found.".format(name))
            return None

        try:
            # go = graph objext
            go = hist_obj[key]
        except Exception:
            return None

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
                result.append([data_timestamp * 1000, None])
                # result.append([data_timestamp * 1000, self.none_value])
            else:
                result.append([data_timestamp * 1000, value * data_factor])

            data_index += 1
            data_timestamp += data_interval

        result.append([data_timestamp * 1000, 0])
        return result

    def get_chart(self, chart, period=None):

        self.log.debug('({}, {})'.format(chart, period))

        if chart in self.cache:
            cache = self.cache[chart]
            self.log.debug("Cache hit for chart '{}': {}.".format(chart, hex(id(cache))))
        else:
            cache = {}

        keys = self.history_object_keys
        if period is not None:
            if period not in keys:
                raise KeyError("'{}' is not a valid History Object Key.".format(period))
            else:
                keys = [period]

        result = {}
        for key in keys:
            k = self.result_object_keys[key]

            if key in cache:
                hist_obj = cache[key]
                self.log.debug("Cache hit for key '{}': {}.".format(key, hex(id(hist_obj))))
            else:
                hist_obj = self._decode_history_object(chart, key)

                if hist_obj is not None:
                    cache[key] = hist_obj

            if hist_obj is not None:
                result[k] = hist_obj

        self.cache[chart] = cache

        return result if len(result) > 0 else None

    def has_document(self):
        # raise NotImplementedError("Please provide a custom 'has_data' function when overwriting 'Document'.")
        return self.document_data is not None

    def has_object(self):
        # raise NotImplementedError("Please provide a custom 'has_data' function when overwriting 'Document'.")
        return self.object_data is not None


class DocumentInterface(object):

    _document = None

    def __init__(self, document):
        self._document = document

    def has_data(self):
        return self._document.has_object()

    def published(self):
        return self._document.published()

    def is_relay(self):
        return self._document.is_relay()

    def is_bridge(self):
        return self._document.is_bridge()


class Details(DocumentInterface):

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

    def __init__(self, document):
        DocumentInterface.__init__(self, document)

    def __call__(self, detail):

        if self.has_data() is False:
            return None

        if self._document.is_relay():
            if detail in self._document.object_data:
                retval = self._document.object_data[detail]
            elif detail in self.relay_detail:
                retval = self.relay_detail[detail]
            else:
                return None

            # print(detail, retval, type(retval))
            return retval

        elif self._document.is_bridge():
            if detail in self._document.object_data:
                return self._document.object_data[detail]
            elif detail in self.bridge_detail:
                return self.bridge_detail[detail]

        return None


class Bandwidth(DocumentInterface):

    def __init__(self, document):
        DocumentInterface.__init__(self, document)

    def read(self, period=None):

        if self.has_data() is False:
            return None
        return self._document.get_chart('read_history', period)

    def write(self, period=None):

        if self.has_data() is False:
            return None
        return self._document.get_chart('write_history', period)


class Weights(DocumentInterface):

    def __init__(self, document):
        DocumentInterface.__init__(self, document)

    def consensus_weight_fraction(self, period=None):
        if self.has_data() is False:
            return None
        return self._document.get_chart('consensus_weight_fraction', period)

    def guard_probability(self, period=None):
        if self.has_data() is False:
            return None
        return self._document.get_chart('guard_probability', period)

    def middle_probability(self, period=None):
        if self.has_data() is False:
            return None
        return self._document.get_chart('middle_probability', period)

    def exit_probability(self, period=None):
        if self.has_data() is False:
            return None
        return self._document.get_chart('exit_probability', period)

    def consensus_weight(self, period=None):
        if self.has_data() is False:
            return None
        return self._document.get_chart('consensus_weight', period)


class OnionOOFactory(object):

    # onionoo holds a dict of key:data pairs, with
    # key = 'details' or 'bandwidth' or 'weights' + ':' + fingerprint
    # data = onionoo.Document object holding the onionoo network response or None
    onionoo = {}
    executor = None

    def __init__(self, proxy=None):

        self.onionoo = {}
        self.query_address = {}
        self.proxy_address = None   # to be formally compliant

        self.proxy(proxy, False)
        self.executor = ThreadPoolExecutor(max_workers=100)     # enough to query > 30 Tors at once...

    def proxy(self, proxy, reconnect=True):

        from stem.util.connection import is_valid_ipv4_address
        from stem.util.connection import is_valid_port

        if proxy is None:
            self.proxy_address = None
            self.query_address = {
                'details': ONIONOO_OPEN + '/details',
                'bandwidth': ONIONOO_OPEN + '/bandwidth',
                'weights': ONIONOO_OPEN + '/weights'
            }
            return

        try:
            address, port = proxy.split(':')
        except ValueError:
            # if 'not enough values to unpack', e.g. no port given
            raise ValueError("Failed to separate address '{}' into address:port.".format(proxy))

        if not is_valid_ipv4_address(address):
            raise ValueError('Invalid IP address: %s' % address)
        elif not is_valid_port(port):
            raise ValueError('Invalid port: %s' % port)

        self.proxy_address = proxy
        self.query_address = {
            'details': ONIONOO_HIDDEN + '/details',
            'bandwidth': ONIONOO_HIDDEN + '/bandwidth',
            'weights': ONIONOO_HIDDEN + '/weights'
        }

    def add(self, fingerprint):

        # there are currently three different documents we query from the onionoo db:
        # Details, Bandwidth & Weights
        # the key identifies the fingerprint as well as the document to allow storage in a flat dict.
        check_key = ['details:' + fingerprint, 'bandwidth:' + fingerprint, 'weights:' + fingerprint]

        # if the key in question isn't in the dict
        for key in check_key:
            if key not in self.onionoo:
                lgr = logging.getLogger('theonionbox')
                lgr.debug('Adding fingerprint {} to onionoo query queue.'.format((fingerprint)))

                # ... add it (yet without document! This indicates that we have no data so far.)
                self.onionoo[key] = Document()

    def remove(self, fingerprint):

        # to remove keys if demanded (which probably will happen rarely!)
        check_key = [ 'details:' + fingerprint, 'bandwidth:' + fingerprint, 'weights:' + fingerprint]

        for key in check_key:
            if key in self.onionoo:
                del self.onionoo[key]

    def refresh(self, only_keys_with_none_data=False, async=True):

        lgr = logging.getLogger('theonionbox')
        lgr.info('Refreshing onionoo data => Only New: {} | Async: {}'.format(only_keys_with_none_data, async))

        # run through the dict of keys and query onionoo for updated documents
        for key in self.onionoo:
            item = self.onionoo[key]

            if only_keys_with_none_data is True:
                if item.has_document() is True:
                    continue

            try:
                data_type, fp = key.split(':')
            except ValueError:
                # This definitely is weird!
                continue

            if async is True:
                self.executor.submit(self.query, item, self.query_address[data_type], fp, self.proxy_address)
            else:
                self.query(item, self.query_address[data_type], fp, self.proxy_address)

    def query(self, for_document, address, fingerprint, proxy):

        lgr = logging.getLogger('theonionbox')
        lgr.debug("Onionoo: Launching query of '{}' for ${}.".format(address, fingerprint))

        # https://trac.torproject.org/projects/tor/ticket/6320
        hash = sha1(a2b_hex(fingerprint)).hexdigest()

        payload = {'lookup': hash}
        headers = {'accept-encoding': 'gzip'}
        if len(for_document.ifModSince) > 0:
            headers['if-modified-since'] = for_document.ifModSince

        proxies = {}
        if proxy is not None:
            proxies = {
                'http': 'socks5://' + proxy,
                'https': 'socks5://' + proxy
            }

        #try:
        r = requests.get(address, params=payload, headers=headers, proxies=proxies)

        lgr.debug("Onionoo: Finished querying '{}' for ${} with status code {}."
                  .format(address, fingerprint, r.status_code))

        if r is None:
            return

        if r.status_code != requests.codes.ok:
            return

        for_document.ifModSince = r.headers['last-modified']
        if r.status_code == requests.codes.not_modified:
            return

        try:
            data = r.json()
        except Exception as exc:
            lgr.debug("Onionoo: Failed to un-json network data; error code says '{}'.".format(exc))
            return

        # print(data)

        for_document.update(data)
        return
        # except Exception as exc:
        #     lgr.info("Onionoo: Failed to query '{}': {}".format(address, exc))
        #    pass

        #return

    def details(self, fingerprint):
        key = 'details:' + fingerprint
        if key in self.onionoo:
            return Details(self.onionoo[key])

    def bandwidth(self, fingerprint):
        key = 'bandwidth:' + fingerprint
        if key in self.onionoo:
            return Bandwidth(self.onionoo[key])

    def weights(self, fingerprint):
        key = 'weights:' + fingerprint
        if key in self.onionoo:
            return Weights(self.onionoo[key])

    def shutdown(self):
        self.executor.shutdown(True)