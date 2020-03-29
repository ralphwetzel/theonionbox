from binascii import a2b_hex
from calendar import timegm
import contextlib
import hashlib
import logging
from math import log10, floor
import requests
import sys
from time import strptime, time, gmtime

from .proxy import Proxy

#####
# Python version detection
py = sys.version_info
py30 = py >= (3, 0, 0)

__supported_protocol__ = ['6.2', '7.0', '8.0']


class Mode(object):
    OPEN = 0
    TOR = 1
    HIDDEN = 2

class TorType(object):
    RELAY = 0
    BRIDGE = 1

ONIONOO_OPEN = 'https://onionoo.torproject.org'
# ONIONOO_HIDDEN = ['http://onionoorcazzotwa.onion', 'http://tgel7v4rpcllsrk2.onion']
ONIONOO_HIDDEN = ['http://tgel7v4rpcllsrk2.onion']


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

    history_object_keys = ['5_years', '1_year', '6_months', '3_months', '1_month', '1_week', '3_days']
    # result_object_keys = ['y5', 'y1', 'm3', 'm1', 'w1', 'd3']

    result_object_keys = {'5_years': 'y5',
                          '1_year': 'y1',
                          '6_months': 'm6',
                          '3_months': 'm3',
                          '1_month': 'm1',
                          '1_week': 'w1',
                          '3_days': 'd3'}

    none_value = -10    # '-10' to distinguish None from 0 (zero)

    cache = {}
    ifModSince = ''

    def __init__(self):
        # self.oo_query = Query(fingerprint)
        self._is_relay = False
        self._is_bridge = False
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
        if v not in __supported_protocol__:
            self.log.warning("Onionoo protocol version mismatch! Received: {} / Prepared for: {}."
                     .format(v, __supported_protocol__))
            # self.update(None)
            # return

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

    def get(self, datum):
        if self.document_data is None:
            return None
        return self.document_data[datum] if datum in self.document_data else None

    def version(self):
        return self.get('version')

    def next_major_version_scheduled(self):
        return self.get('next_major_version_scheduled')

    def relays_published(self):
        return self.get('relays_published')

    def relays(self):
        rlys = self.get('relays')
        if rlys is None:
            return None
        if len(rlys) > 0:
            return rlys[0]
        return None

    def bridges_published(self):
        return self.get('bridges_published')

    def bridges(self):
        brdgs = self.get('bridges')
        if brdgs is None:
            return None
        if len(brdgs) > 0:
            return brdgs[0]
        return None

    def is_relay(self):
        return self._is_relay

    def is_bridge(self):
        return self._is_bridge

    def is_unknown(self):
        return not (self._is_relay or self._is_bridge)

    def published(self):
        if self.is_relay():
            return self.relays_published()
        elif self.is_bridge():
            return self.bridges_published()
        else:
            return None

    def _decode_history_object(self, name, key, factor=1):

        self.log.debug('({}, {})'.format(name, key))

        if self.object_data is None:
            return None

        # lgr = logging.getLogger('theonionbox')

        try:
            hist_obj = self.object_data[name]
        except Exception:
            # This Exception will be raised if a wrong 'name' was provided while programming
            # OR if the relay is so young that there are no historical infos in the onionoo data!
            self.log.warning("While decoding Onionoo history data: Key '{}' not found.".format(name))

            return None

        try:
            # go = graph objext
            go = hist_obj[key]
        except Exception:
            return None

        # print(go)

        result = []

        data = go['values']
        data_index = 0
        data_count = go['count']
        data_interval = go['interval']
        data_factor = go['factor']

        # mitigation of broken protocol @ 20180808
        ts = go['first']
        if type(ts) is int:
            ts_now = time()
            # check if ts is in ms?
            base = floor(log10(ts)) - floor(log10(ts_now))
            utc_timestruct = gmtime(ts / (10**base))
        else:
            # if it's neither an int nor a string, this will raise!
            utc_timestruct = strptime(ts, '%Y-%m-%d %H:%M:%S')

        data_timestamp = timegm(utc_timestruct)

        while data_index < data_count:
            value = data[data_index]
            if value is None:
                result.append([data_timestamp * 1000, None])
                # result.append([data_timestamp * 1000, self.none_value])
            else:
                result.append([data_timestamp * 1000, value * data_factor * factor])

            data_index += 1
            data_timestamp += data_interval

        result.append([data_timestamp * 1000, 0])
        return result

    def get_chart(self, chart, period=None, factor=1):

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
                hist_obj = self._decode_history_object(chart, key, factor)

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

    def is_unknown(self):
        return self._document.is_unknown()

class Details(DocumentInterface):

    # onionoo protocol v7.0
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
        'as': None,
        # 'as_number': None,
        'as_name': None,
        'consensus_weight': 0,
        # 'host_name': None,
        'verified_host_names': None,
        'unverified_host_names': None,
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
        'version': None,
        'recommended_version': None,
        'version_status': None,
        'effective_family': None,
        'alleged_family': None,
        'indirect_family': None,
        'consensus_weight_fraction': None,
        'guard_probability': None,
        'middle_probability': None,
        'exit_probability': None,
        'measured': None,
        'unreachable_or_addresses': None
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
        'version': None,
        'recommended_version': None,
        'version_status': None,
        # 'effective_family': None,
        # 'alleged_family': None,
        # 'indirect_family': None,
        # 'consensus_weight_fraction': None,
        # 'guard_probability': None,
        # 'middle_probability': None,
        # 'exit_probability': None,
        # 'measured': None,
        # 'unreachable_or_addresses': None
        'transports': None
    }

    def __init__(self, document):
        DocumentInterface.__init__(self, document)

    def __call__(self, detail):

        if self.has_data() is False:
            return None

        retval = None

        if self._document.is_relay():
            if detail in self._document.object_data:
                retval = self._document.object_data[detail]
            elif detail in self.relay_detail:
                retval = self.relay_detail[detail]

        elif self._document.is_bridge():
            if detail in self._document.object_data:
                retval = self._document.object_data[detail]
            elif detail in self.bridge_detail:
                retval = self.bridge_detail[detail]

        # OO sometimes returns strings with encoded unicode characters
        # e.g. Baden-W\u00FCrttemberg Region
        if isinstance(retval, str):
            retval = bytes(retval, 'utf-8').decode()

        return retval

class Bandwidth(DocumentInterface):

    def __init__(self, document):
        DocumentInterface.__init__(self, document)

    def read(self, period=None):

        if self.has_data() is False:
            return None
        return self._document.get_chart('read_history', period, factor=-1)

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

# v5.x implementation

from enum import Enum, auto
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.executors.pool import ThreadPoolExecutor
from datetime import datetime, timedelta
from random import randint


class OnionooData:

    def __init__(self, documents: dict):
        self.documents = documents

    @property
    def details(self):
        return Details(self.documents[OnionooDocument.DETAILS])

    @property
    def bandwidth(self):
        return Bandwidth(self.documents[OnionooDocument.BANDWIDTH])

    @property
    def weights(self):
        return Weights(self.documents[OnionooDocument.WEIGHTS])


class OnionooDocument(Enum):
    DETAILS = 'details'
    BANDWIDTH = 'bandwidth'
    WEIGHTS = 'weights'


class OnionooManager():

    def __init__(self, proxy: Proxy = None):

        self.log = logging.getLogger('theonionbox')

        self.proxy = proxy
        self.documents = {}

        executors = {
            'default': ThreadPoolExecutor(50)
        }
        job_defaults = {
            'coalesce': True,
            'max_instances': 10
        }
        self.scheduler = BackgroundScheduler(logger=self.log, executors=executors, job_defaults=job_defaults)
        self.scheduler.start()

    def shutdown(self):
        self.scheduler.shutdown()

    def query(self, update: Document, document: OnionooDocument, fingerprint: str):

        # https://trac.torproject.org/projects/tor/ticket/6320
        hash = hashlib.sha1(a2b_hex(fingerprint)).hexdigest()
        payload = {'lookup': hash}

        headers = {'accept-encoding': 'gzip'}
        if len(update.ifModSince) > 0:
            headers['if-modified-since'] = update.ifModSince

        proxy_address = self.proxy.address() if self.proxy is not None else None

        if proxy_address is None:
            proxies = {}
            query_base = ONIONOO_OPEN
        else:
            proxies = {
                'http': 'socks5h://' + proxy_address,
                'https': 'socks5h://' + proxy_address
            }
            query_base = ONIONOO_HIDDEN[randint(0,len(ONIONOO_HIDDEN) - 1)]

        query_address = '{}/{}'.format(query_base, document.value)

        r = None

        self.log.debug(f"OoM|{fingerprint[:6]}: Launching query @ '{query_address}'.")

        try:
            r = requests.get(query_address, params=payload, headers=headers, proxies=proxies, timeout=10)
        except requests.exceptions.ConnectTimeout:
            self.log.info(f"OoM|{fingerprint[:6]}/{document.value}: Connection timeout @ '{query_base}'.")
            # We'll try again next time...
        except Exception as exc:
            self.log.warning(f"OoM|{fingerprint[:6]}: Failed querying '{query_address}' -> {exc}.")
        else:
            self.log.debug(f"OoM|{fingerprint[:6]}/{document.value}: {r.status_code}; {len(r.text)} chars received.")

        if r is None:
            return

        update.ifModSince = r.headers['last-modified']
        if r.status_code != requests.codes.ok:
            return

        try:
            data = r.json()
        except Exception as exc:
            self.log.debug(f"OoM|{fingerprint[:6]}/{document.value}: Failed to un-json network data -> {exc}.")
            return

        print(data)

        update.update(data)

    def register(self, fingerprint: str) -> OnionooData:

        self.log.debug(f'Registering OoM|{fingerprint[:6]}.')

        documents = {}

        for d in OnionooDocument:
            hash = hashlib.sha256(f'{fingerprint.lower()}|{d.value}'.encode('UTF-8')).hexdigest()

            if hash not in self.documents:
                self.documents[hash] = Document()

                self.scheduler.add_job(self.query,
                                       trigger='interval', hours=2, jitter=3600,
                                       next_run_time=datetime.now(),  # to trigger once immediately!
                                       kwargs={'update': self.documents[hash], 'document': d, 'fingerprint': fingerprint},
                                       id=hash
                                       )

            documents[d] = self.documents[hash]

        return OnionooData(documents)

    def trigger(self, fingerprint: str):

        for d in OnionooDocument:
            hash = hashlib.sha256(f'{fingerprint.lower()}|{d.value}'.encode('UTF-8')).hexdigest()
            with contextlib.suppress(Exception):
                self.scheduler.get_job(job_id=hash).modify(next_run_time=datetime.now())


__ONIONOO__ = None

def getOnionoo():
    global __ONIONOO__
    if not __ONIONOO__:
        __ONIONOO__ = OnionooManager()
    return __ONIONOO__
