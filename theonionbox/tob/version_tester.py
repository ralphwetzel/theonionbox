import requests
import re


class Version(object):

    version = ''

    def __init__(self, *args):
        if len(args) == 3:
            self.version = '.'.join(str(i) for i in args)

    def __get__(self):
        return self.version

    def __str__(self):
        return self.version


class TorVersionTester(object):

    stable_list = []
    unstable_list = []
    rc_list = []

    def __init__(self):
        self.update()

    def update(self):

        r = requests.get('https://dist.torproject.org/')

        if r.status_code == 200:
            versions = re.findall('(?!tor-)(\d\.\d\.\d{1,2}\.\d{1,2}(?:-alpha|-rc)?)(?=\.tar\.gz)', r.text)
            versions = list(set(versions))  # remove all duplicates

            self.stable_list = []
            self.unstable_list = []
            self.rc_list = []

            for version in versions:
                alpha = False
                rc = False
                if version[-6:] == '-alpha':
                    alpha = True
                    version = version[:-6]
                elif version[-3:] == '-rc':
                    rc = True
                    version = version[:-3]
                v = version.split('.')      # separate the version number parts
                v = [int(y) for y in v]     # string to int
                if alpha or rc:
                    self.unstable_list.append(v)
                else:
                    self.stable_list.append(v)
                if rc:
                    self.rc_list.append(v)

            self.stable_list.sort()   # sort; latest version will be last entry
            self.unstable_list.sort()

            return True

        return False

    def latest_stable(self):
        if len(self.stable_list) > 0:
            return '.'.join(str(i) for i in self.stable_list[-1])

    def latest_unstable(self):
        if len(self.unstable_list) > 0:
            v = self.unstable_list[-1]
            pf = 'alpha'   # postfix
            if v in self.rc_list:
                pf = 'rc'
            return '{}-{}'.format('.'.join(str(i) for i in v), pf)

    def latest(self):
        ls = la = [0, 0, 0, 0]

        if len(self.stable_list) > 0:
            ls = self.stable_list[-1]

        if len(self.unstable_list) > 0:
            la = self.unstable_list[-1]

        if ls > la:
            return self.latest_stable()
        else:
            return self.latest_unstable()

    def is_latest(self, version):
        return str(version) == self.latest()

    def is_latest_stable(self, version):
        return str(version) == self.latest_stable()

    def is_latest_unstable(self, version):
        return str(version) == self.latest_unstable()

    @staticmethod
    def test_alpha(self, version):
        v = str(version)
        return v[-6:] == '-alpha'

    @staticmethod
    def test_rc(self, version):
        v = str(version)
        return v[-3:] == '-rc'

