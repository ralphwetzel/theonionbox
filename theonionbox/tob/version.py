import uuid
import requests
import typing
import bottle


class LastModifiedContainer:

    def __init__(self):
        self.lm = None
        self.lm_epoch = 0

    @property
    def last_modified(self):
        return self.lm_epoch

    @property
    def last_mod_header(self):
        return self.lm

    @last_mod_header.setter
    def last_mod_header(self, lm):
        self.lm = lm
        self.lm_epoch = bottle.parse_date(lm) or 0


class VersionManager(object):

    class Version:
        def __init__(self, last_mod: LastModifiedContainer):
            self.last_mod = last_mod

        @property
        def last_modified(self):
            return self.last_mod.last_modified

    class NullVersion(Version):
        def __init__(self, last_mod):
            super().__init__(last_mod)
            self.version = None

    class TorVersion(Version):

        def __init__(self, last_mod):
            super().__init__(last_mod)
            self.stable = None
            self.unstable = None

        def is_latest_stable(self, version):
            if self.stable is None:
                return None
            return str(version) == self.stable

        def is_latest_unstable(self, version):
            if self.unstable is None:
                return None
            return str(version) == self.unstable
        
    class BoxVersion(Version):

        def __init__(self, last_mod):
            super().__init__(last_mod)
            self.version = None
            self.message = None

        def latest_version(self):
            if self.version is None:
                return None

            latest = '{}.{}'.format(self.version[0], self.version[1])
            if self.version[2] != 0:
                latest += '.{}'.format(self.version[2])
            return latest

        def is_latest_tag(self, tag):

            if self.version is None:
                return None

            t2v = self.tag2version(tag)

            if self.tag_is_RC(tag) is True:
                # if tag is an RC, a non RC version with same number is the latest one!
                return t2v > self.version
            else:
                return t2v >= self.version

        @staticmethod
        # returns a version tuple
        def tag2version(tag):

            if tag[0] == 'v':
                tag = tag[1:]

            tag = tag.lower().split('rc')[0]    # strip 'RC..'
            tag = tag.lower().split('dev')[0]   # strip 'dev'
            tag = tag.lower().split('post')[0]   # strip 'post'
            tag = tag.lower().split('alpha')[0]   # strip 'alpha'

            if tag[-1:] == '.':
                tag = tag[:-1]

            v = tag.split('.')
            v = [int(y) for y in v]  # string to int
            while len(v) < 3:
                v.append(0)

            return tuple(v[:3])

        @staticmethod
        # check if tag has 'rc' in it
        def tag_is_RC(tag):
            tags = tag.lower().split('rc')
            return len(tags) > 1

    def __init__(self, proxy, current_version, system, release):
        self.id = uuid.uuid4().hex
        self.proxy = proxy
        self.lmc = LastModifiedContainer()
        self.Tor = self.TorVersion(self.lmc)
        self.Box = self.BoxVersion(self.lmc)
        self.Null = self.NullVersion(self.lmc)
        self.version = current_version
        self.system = system
        self.release = release
        self.last_mod = ''

    def update(self):

        # No service without proxy!
        if self.proxy is None:
            return False

        proxy_address = self.proxy.address()
        if proxy_address is None:
            return False

        # v19.2
        __VERSION_PROTOCOL__ = 3

        proxies = {
            'http': 'socks5h://' + proxy_address,
            'https': 'socks5h://' + proxy_address
        }
        payload = {
            'protocol': __VERSION_PROTOCOL__,
            'version': self.version,
            'system': self.system,
            'release': self.release
        }

        headers = {
            'if-modified-since': self.lmc.last_mod_header
        }

        address = 'http://t527moy64zwxsfhb.onion/{}/check.html'.format(self.id)

        r = None

        try:
            r = requests.get(address, proxies=proxies, headers=headers, params=payload, timeout=10)
        except Exception as exc:
            pass

        if r is None:
            return False
        if r.status_code == requests.codes.not_modified:
            return True
        if r.status_code != 200:
            return False

        back = r.json()

        if 'protocol' not in back:
            return False

        if int(back['protocol']) != __VERSION_PROTOCOL__:
            return False

        # 'protocol': 3
        # 'tor':
        #   'stable':   latest stable tor version
        #   'unstable': latest unstable (alpha, rc) tor version
        # 'box':
        #   'latest': [a, b, c] version number of latest release
        #   'message': Message returned from the Update Service
        # 'null':
        #   'version': Latest version of the tornull definition file

        if 'tor' in back:
            _tor = back['tor']
            if 'stable' in _tor:
                self.Tor.stable = _tor['stable']
            if 'unstable' in _tor:
                self.Tor.unstable = _tor['unstable']

        if 'box' in back:
            _box = back['box']
            if 'latest' in _box:
                latest = _box['latest']
                try:
                    while len(latest) < 3:
                        latest.append(0)
                    self.Box.version = tuple(latest[:3])
                except:
                    pass
            if 'message' in _box:
                self.Box.message = _box['message']

        _null = back.get('null', None)
        if _null is not None:
            self.Null.version = _null.get('version', None)

        self.lmc.last_mod_header = r.headers.get('Last-Modified', '')

        return True
