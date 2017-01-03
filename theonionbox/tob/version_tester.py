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
    alpha_list = []

    def __init__(self):
        self.update()

    def update(self):

        r = requests.get('https://dist.torproject.org/')

        if r.status_code == 200:
            versions = re.findall('(?!tor-)(\d\.\d\.\d{1,2}\.\d{1,2}(?:-alpha)?)(?=\.tar\.gz)', r.text)
            versions = list(set(versions))  # remove all duplicates

            self.stable_list = []
            self.alpha_list = []

            for version in versions:
                alpha = False
                if version[-6:] == '-alpha':
                    alpha = True
                    version = version[:-6]
                v = version.split('.')      # separate the version number parts
                v = [int(y) for y in v]     # string to int
                if alpha:
                    self.alpha_list.append(v)
                else:
                    self.stable_list.append(v)

            self.stable_list.sort()   # sort; latest version will be last entry
            self.alpha_list.sort()

            return True

        return False

    def latest_stable(self):
        if len(self.stable_list) > 0:
            return '.'.join(str(i) for i in self.stable_list[-1])

    def latest_alpha(self):
        if len(self.alpha_list) > 0:
            return '{}-alpha'.format('.'.join(str(i) for i in self.alpha_list[-1]))

    def latest(self):
        ls = la = [0, 0, 0, 0]

        if len(self.stable_list) > 0:
            ls = self.stable_list[-1]

        if len(self.alpha_list) > 0:
            la = self.alpha_list[-1]

        if ls > la:
            return self.latest_stable()
        else:
            return self.latest_alpha()

    def is_latest(self, version):
        return str(version) == self.latest()

    def is_latest_stable(self, version):
        return str(version) == self.latest_stable()

    def is_latest_alpha(self, version):
        return str(version) == self.latest_alpha()

    @staticmethod
    def test_alpha(self, version):
        v = str(version)
        return v[-6:] == '-alpha'

class tobVersionTester(object):

    latest = (0, 0, 0)

    def __init__(self):
        self.update()

    def update(self):

        r = requests.get('https://api.github.com/repos/ralphwetzel/theonionbox/releases/latest')

        if r.status_code == 200:
            json = r.json()

            tn = json.get('tag_name', None)
            if tn:
                if tn[0] == 'v':
                    tn = tn[1:]

                v = tn.split('.')
                v = [int(y) for y in v]  # string to int
                while len(v) < 3:
                    v.append(0)

                latest = tuple(v[:2])

                return True

        return False

    def is_latest_release(self, version):
        pass



