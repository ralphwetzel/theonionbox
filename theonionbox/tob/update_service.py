import uuid

class updateChecker(object):

    latest = (0, 0, 0)
    message = ''

    def __init__(self, proxy):
        self.id = uuid.uuid4().hex
        self.proxy = proxy
        self.message = ''
        self.latest = (0,0,0)

    def update(self):

        address = 'http://t527moy64zwxsfhb.onion/{}/check.html'.format(self.id)

        proxies = {}
        if self.proxy is not None:
            proxies = {
                'http': 'socks5://' + self.proxy,
                'https': 'socks5://' + self.proxy
            }

        r = None

        try:
            r = requests.get(address, proxies=proxies, timeout=10)
        except:
            pass

        if r is None:
            return False

        if r.status_code == 200:
            back = r.json()

            if 'protocol' in back:
                if int(back['protocol']) == 1:

                    # 'protocol': 1
                    # 'latest': [a, b, c] version number of latest release
                    # 'message': Message returned from the Update Service

                    if 'latest' in back:
                        latest = back['latest']
                        try:
                            while len(latest) < 3:
                                latest.append(0)
                            self.latest = tuple(latest[:3])
                        except:
                            pass
                    if 'message' in back:
                        self.message = back['message']

    def is_latest_tag(self, tag):
        t2v = self.tag2version(tag)

        if self.tag_is_RC(tag) is True:
            # if tag is an RC, a non RC version with same number is the latest one!
            return t2v > self.latest
        else:
            return t2v >= self.latest

    @staticmethod
    # returns a version tuple
    def tag2version(tag):

        if tag[0] == 'v':
            tag = tag[1:]

        tag = tag.split('RC')[0]

        v = tag.split('.')
        v = [int(y) for y in v]  # string to int
        while len(v) < 3:
            v.append(0)

        return tuple(v[:3])

    @staticmethod
    # check if tag has 'RC' in it
    def tag_is_RC(tag):
        tags = tag.split('RC')
        return len(tags) > 1

    def get_latest(self):
        latest = '{}.{}'.format(self.latest[0], self.latest[1])
        if self.latest[2] != 0:
            latest += '.{}'.format(self.latest[2])
        return latest

    def get_message(self):
        return self.message

