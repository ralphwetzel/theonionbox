from collections import OrderedDict
from pyquery import PyQuery as pq
import requests
from typing import Optional


class Consensus:

    def __init__(self):
        self.last_modified = ''
        self.file = None
        self.update()

    def update(self):

        headers = {'accept-encoding': 'gzip'}
        if len(self.last_modified) > 0:
            headers['if-modified-since'] = self.last_modified

        r = requests.get('https://consensus-health.torproject.org/consensus-health.html', headers=headers, timeout=15)

        if r is None:
            return False

        if r.status_code == requests.codes.not_modified:
            return True

        if r.status_code != requests.codes.ok:
            return False

        self.last_modified = r.headers['last-modified']

        self.file = r.text
        return True

    def consensus(self, fingerprint: str) -> Optional[OrderedDict]:

        c = OrderedDict()

        servers = {
            'gabel.': 'gabelmoo',
            'danne.': 'dannenberg',
            'maatu.': 'maatuska',
            'farav.': 'faravahar',
            'longc.': 'longclaw',
            'consensus': 'Consensus'
        }
        if self.file is None:
            return None

        d = pq(self.file)
        p = d('tr.tbl-hdr:first > th')

        header = [th.text() for th in p.items()]
        # print(header)

        p = d(f'td#{fingerprint}')
        if p.length == 0:
            return None

        p = p.parent().children()

        for index, td in enumerate(p):
            
            h = header[index]
            if h.lower() in ['fingerprint', 'nickname']:
                continue
            elif h == 'consensus':
                prefix = "$"
            else:
                prefix = ''

            if h in servers:
                h = servers[h]

            html = pq(td).html()
            # html: 'Fast <br/>Running <br/><span class="oict">!</span><span class="oic">Unmeasured</span> <br/>Valid <br/>bw=1040'

            flags = []

            # html is None for empty columns
            if html:

                # split html
                s = html.split(' <br/>')

                for flag in s:
                    # len(flag) == 0 for empty cells
                    if len(flag) > 0 and flag[0] == '<':
                        # pq adds a surrounding '<span>'
                        f = pq(flag).children()
                        for span in f:
                            span = pq(span)
                            cls = span.attr('class')
                            if cls == 'oict':   # Only-In-Consensus: marker (??)
                                continue
                            if cls == 'oic':    # Only-In-Consensus: line-through
                                flag = f'!{span.text()}'
                                break
                            if cls == 'oiv':    # Only-In-Vote: red
                                flag = f'*{span.text()}'
                                break

                    flags.append(f'{prefix}{flag}')

            c[h] = flags

        # print(c)
        return c

    def additional_flags(self, fp: str) -> Optional[list]:

        c = self.consensus(fp)

        if 'Consensus' not in c:
            return None

        flags = c['Consensus']
        check_for = ['NoEdConsensus', 'StaleDesc', 'ReachableIPv6', 'NoIPv6Consensus',
                     'FallbackDir', 'Unmeasured', 'DescriptorMismatch']

        r = [f for f in check_for if f in flags]
        return r

