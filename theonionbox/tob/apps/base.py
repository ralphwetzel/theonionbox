import logging
import contextlib
from threading import RLock

# from bottle import Bottle, HTTPError, redirect
import bottle

from tob.session import SessionManager, Session, make_short_id
from tob.nodes import Manager as NodesManager
from tob.proxy import Proxy
from tob.utils import AttributedDict
from tob.version import VersionManager


class BaseApp:

    def __init__(self
                 , sessions: SessionManager
                 , nodes: NodesManager
                 , proxy: Proxy
                 , version: VersionManager
                 , config: AttributedDict):

        self.sessions = sessions
        self.nodes = nodes
        self.proxy = proxy
        self.version = version
        self.config = config
        self.log = logging.getLogger('theonionbox')
        self.latest_pi = None
        self.lock = RLock()

        self.icon = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwQAADsEBu" \
                    "JFr7QAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC42/Ixj3wAAAXBJREFUOE+lk7tKA1EQhvcJfAKxFt9ErA" \
                    "TBRmxEbCQIgqKNjZCYygsbtJREjJpFURSNNtEUgRTGSqxDIGgKkxQpx/2GnLNHXJHgwr87Zy7/XM6sJyJe+PAaGP3" \
                    "Y8LAxZDGSHJPdlC+X61dSmAkUyOiwub59oohgYTshhdlAsuO5WGDDJ5YAg3G8Xb6TeqUuvc+eArm4UlRbbuJI5vcW" \
                    "vxNQmslc3a9Kt9mVx+STnE6fSRC2UE6XVfd8WFOf87kLGU6NRgT0ZzLjSCBnF/mpE7WZSna2/IiAIaGkVDIjXydu5" \
                    "P31QwExOmz4IBNjCZg0Svo12QnkC1pvLf3SDj7IxFgCDCgHIUC2BG4Lpc2SypRNILhfe1Ddry1k0geqZEDtRluOJ/" \
                    "N6doGu0+jYIRJjCdxr5KqYNpWYayQzwbXsi/rgq1tpCFiKJX/VZiMLpdIvQHYXCd8fm2hI/lplGxxHACiN/hgS5QN" \
                    "kdLE/0/9+Z/G+AJ9+UUM+BIFlAAAAAElFTkSuQmCC"

        self.app = bottle.Bottle()

        #####
        # BasePath Management
        # self.redirect prepends the configured box.base_path to bottle.redirect
        #

        class _RedirectWithBasePathProvider:

            def __init__(self, base_path):
                self.base = base_path

            def __call__(self, url: str = '/', code=None):
                bottle.redirect(f'{self.path(url)}', code)

            def path(self, url: str = '/'):
                return f'{self.base}{url}'

        self.redirect = _RedirectWithBasePathProvider(self.config.box.base_path)

        #####
        # Time Management
        #
        from tob.deviation import getTimer

        self.time = getTimer()

    def connect_session_to_node(self, session: Session, node_id: str):

        if session is None or node_id is None:
            raise bottle.HTTPError(404)

        try:
            node = self.nodes[node_id]
        except KeyError:
            self.sessions.delete_session(session)
            raise bottle.HTTPError(404)

        self.log.debug(f'Session {make_short_id(session.id)} o-?-o {node.id} Node')

        # with self.lock:

        # Create controller & connect it...
        node.connect(proxy=self.proxy)

        # Ok. So far it looks good. Let's store this for later use!
        session['node'] = node_id

        try:
            self.latest_pi = node.controller.get_protocolinfo()
        except:
            self.latest_pi = None

        # Perform authentication
        # This raises (MissingPassword, IncorrectPassword) in case ...
        node.controller.authenticate(password=session.get('password'), protocolinfo_response=self.latest_pi)

        # Done!
        self.log.debug(f'Session {make_short_id(session.id)} o-+-o {node.id} Node')
        node.logs.add_client(session.id)

    def merge(self, routes):
        self.app.merge(routes)

    @property
    def routes(self):
        return self.app.routes

    # def go(self, *args) -> str:
    #     a = args or []
    #     p = '/'.join(a)
    #     return '{}/{}'.format(self.config.box.base_path, p)

    # def redirect(self, url: str = '/', code=None):
    #     bottle.redirect(f'{self.config.box.base_path}{url}', code)

    @staticmethod
    def verify_fingerprint(fp: str) -> bool:

        if len(fp) < 1:
            return False

        if fp[0] == '$':
            fp = fp[1:]
        if len(fp) != 40:
            return False

        # inspired by stem
        try:
            int(fp, 16)
        except (ValueError, TypeError):
            return False

        return True