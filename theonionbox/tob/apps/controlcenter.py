import contextlib
import json
import logging
import time
import uuid

import bottle

from tob.apps import BaseApp
from tob.ccfile import CCFile
from tob.nodes import Manager as NodesManager, AlreadyRegisteredError, Node, NotConnectedError
from tob.plugin.session import SessionPlugin
from tob.proxy import Proxy as TorProxy
from tob.session import SessionManager, Session
from tob.utils import AttributedDict
from tob.version import VersionManager
import stamp


class CCError(bottle.HTTPError):

    def __init__(self, status=None, origin=None, body=None, exception=None, traceback=None,
                 **options):
        self.origin = origin
        super(CCError, self).__init__(status, body, exception, traceback, **options)

    def apply(self, response):
        super(CCError, self).apply(response)
        if self.origin is not None:
            response.set_header('Content-Location', self.origin)


class ControlCenter(BaseApp):

    def __init__(self
                 , sessions: SessionManager
                 , nodes: NodesManager
                 , proxy: TorProxy
                 , version: VersionManager
                 , config: AttributedDict):

        super(ControlCenter, self).__init__(sessions=sessions, nodes=nodes, proxy=proxy, version=version,
                                            config=config)

        self.base_path = self.config.box.base_path
        self.cc = CCFile(self.config.cc)
        self.fingerprints = {}
        self.show_logout = None

        config = {
            'no_session_redirect': self.redirect.path('/'),
            'valid_status': ['auto', 'prepared', 'frame']
        }

        self.app.route('/<session>/cc.html',
                       method='GET',
                       callback=self.get_cc,
                       apply=SessionPlugin(sessions),
                       **config)

        config = {
            'valid_status': ['frame']
        }

        self.app.route('/<session>/cc/ping',
                       method='POST',
                       callback=self.post_cc_ping,
                       apply=SessionPlugin(sessions),
                       **config)

        self.app.route('/<session>/cc/license',
                       method='POST',
                       callback=self.post_cc_license,
                       apply=SessionPlugin(sessions),
                       **config)

        self.app.route('/<session>/cc/about',
                       method='POST',
                       callback=self.post_cc_about,
                       apply=SessionPlugin(sessions),
                       **config)

        self.app.route('/<session>/cc/logout',
                       method='GET',
                       callback=self.get_cc_logout,
                       apply=SessionPlugin(sessions),
                       **config)

        config = {
            'valid_status': ['cc_new', 'cc_login', 'cc_ok']
        }

        self.app.route('/<session>/cc/data',
                       method='POST',
                       callback=self.post_cc_data,
                       apply=SessionPlugin(sessions),
                       **config)

        # self.app.route('/<session>/cc/control.html',
        #                method='POST',
        #                callback=self.post_cc_control,
        #                apply=SessionPlugin(sessions),
        #                **config)

        self.app.route('/<session>/cc/ciao.html',
                       method='POST',
                       callback=self.post_cc_ciao,
                       apply=SessionPlugin(sessions),
                       **config)

        self.app.route('/<session>/cc/login',
                       method='POST',
                       callback=self.post_cc_login,
                       apply=SessionPlugin(sessions),
                       **config)

        self.app.route('/<session>/cc/position',
                       method='POST',
                       callback=self.post_position,
                       apply=SessionPlugin(sessions),
                       **config)

        config = {
            'valid_status': ['cc_new']
        }

        self.app.route('/<session>/cc/md5.js',
                       method='GET',
                       callback=self.get_md5,
                       apply=SessionPlugin(sessions),
                       **config)

        # To show the detail dashboard for a node
        config = {
            'valid_status': ['cc_ok']
        }

        self.app.route('/<session>/cc/details',
                       method='GET',
                       callback=self.get_details,
                       apply=SessionPlugin(sessions),
                       **config)

        # Node property management
        config = {
            'valid_status': ['frame', 'cc_new', 'cc_ok']
        }

        self.app.route('/<session>/cc/check',
                       method='POST',
                       callback=self.post_check_node,
                       apply=SessionPlugin(sessions),
                       **config)

        self.app.route('/<session>/cc/save',
                       method='POST',
                       callback=self.post_save_node,
                       apply=SessionPlugin(sessions),
                       **config)

        config = {
            'valid_status': ['cc_new', 'cc_ok']
        }

        self.app.route('/<session>/cc/edit',
                       method='POST',
                       callback=self.post_edit_node,
                       apply=SessionPlugin(sessions),
                       **config)

        self.app.route('/<session>/cc/remove',
                       method='POST',
                       callback=self.post_remove_node,
                       apply=SessionPlugin(sessions),
                       **config)

        # def debug_request():
        #     self.log.debug(bottle.request.environ['PATH_INFO'])
        #
        # # Log connection requests...
        # self.app.add_hook('before_request', debug_request)

    # The CC frame
    def get_cc(self, session):

        log = logging.getLogger('theonionbox')

        if session is None or 'status' not in session:
            raise bottle.HTTPError(404)

        status = session['status']

        # check only at first run, not when re-loaded...
        if self.show_logout is None:
            self.show_logout = (session['status'] != 'auto')

        if status == 'prepared':

            delay = time.time() - session['prep_time']

            if delay > 2.0:  # seconds
                session['status'] = 'toolate'  # ;)
                log.info('{}@{}: Login to Session delay expired. Session canceled.'
                            .format(session.id_short(), self.sessions.get_remote_address(session.id)))
            else:
                session['status'] = 'ok'
                # we have a successfull connection! Celebrate this!
                log.notice('{}@{}: Session established.'.format(session.id_short(),
                                                                self.sessions.get_remote_address(session.id)))

        if session['status'] not in ['ok', 'auto', 'frame']:
            self.sessions.delete_session(session)
            self.redirect('/')

        node = session['node']
        if node is None:
            self.sessions.delete_session(session)
            self.redirect('/')

        # This indicates the session is now the CC frame
        session['status'] = 'frame'

        session['stylesheets'] = ['bootstrap.css', 'latolatin/latolatinfonts.css', 'fontawesome/css/all.css', 'cc.css']
        session['scripts'] = ['jquery.js', 'bootstrap.js', 'smoothie.js', 'scrollMonitor.js',
                              'chart.js', 'cc.js', 'md5.js', 'pep.js']

        params = {
            'session': session,
            'virtual_basepath': self.base_path,
            'show_logout': self.show_logout,
            'icon': self.icon,
            'stamp': stamp,
            'launcher': 1 if 'cards' not in session else 0
        }

        session['cc.js'] = bottle.template("scripts/cc.js", **params)
        session['cc.css'] = bottle.template("css/cc.css", **params)

        return bottle.template('pages/cc.html', **params)

    def post_check_node(self, session):

        def verify_tor_control_port(protocol_info):
            pi = protocol_info.splitlines()
            # print(pi)
            if len(pi) == 4:
                if len(pi[0]) > 16 and pi[0][:16] == '250-PROTOCOLINFO':
                    if len(pi[3]) == 6 and pi[3] == '250 OK':
                        return True
            return False

        def verify_port(port):

            try:
                p = int(port)
            except ValueError:
                raise ValueError('Wrong value for Port.')

            if p < 0 or p > 65535:
                raise ValueError('Wrong value for Port.')

            return p

        # def verify_tor_password(response: str) -> bool:
        #     if len(response) < 3:
        #         return False
        #     return response[:3] == '250'

        # action = request.forms.get('action')
        connect = bottle.request.forms.get('connect')
        host = bottle.request.forms.get('host')
        port = bottle.request.forms.get('port')
        pwd = bottle.request.forms.get('password')
        cookie = bottle.request.forms.get('cookie')

        # translate unmod cookie indicator into cookie value from config
        node = self.nodes[session['node']]
        config = node.config

        if cookie == session['edit_unmod']:
            cookie = config.cookie

        sc = None
        piok = False
        auth = False

        # We're NOT going to test the password, as this could expose it to a hostile party.
        try:

            if connect == 'port':
                from tob.simplecontroller import SimplePort
                p = verify_port(port)
                sc = SimplePort(host, p)

            elif connect == 'socket':
                from tob.simplecontroller import SimpleSocket
                sc = SimpleSocket(host)

            elif connect == 'proxy':
                from tob.simplecontroller import SimpleProxy
                p = verify_port(port)
                if cookie and len(cookie) > 0:
                    self.proxy.assure_cookie(host, cookie)
                sc = SimpleProxy(host, p, self.proxy.host, self.proxy.port)

            if sc is not None:
                piok = verify_tor_control_port(sc.msg('PROTOCOLINFO 1'))

                # if piok is True and len(pwd) > 0:
                #     print(pwd)
                #     auth = verify_tor_password(sc.msg(f'AUTHENTICATE "{pwd}"'))

                sc.shutdown()
                del sc

        except Exception as exc:
            return f'500 NOK\n{exc}'

        # if len(pwd) > 0:
        #     return '1' if auth is True else '0'

        return '250 OK' if piok is True else '500 NOK\nNot a Tor ControlPort or ControlSocket.'

    def post_save_node(self, session):

        label = bottle.request.forms.get('label', '').strip()
        control = bottle.request.forms.get('connect', '').strip()
        host = bottle.request.forms.get('host', '').strip()
        port = bottle.request.forms.get('port', '').strip()
        password = bottle.request.forms.get('password', '').strip()
        cookie = bottle.request.forms.get('cookie', '').strip()

        # Basic data integrity check
        if control not in ['port', 'socket', 'proxy']:
            raise bottle.HTTPError(400)

        if control in ['port', 'proxy']:
            if host is None or len(host) < 1:
                raise bottle.HTTPError(400)
            if port is None or len(port) < 1:
                raise bottle.HTTPError(400)

        if control in ['socket']:
            if host is None or len(host) < 1:
                raise bottle.HTTPError(400)

        status = session['status']

        if status in ['frame']:
            config = self.cc.add_node()     # This returns None if readonly!
            if config is None:
                raise bottle.HTTPError(403)
        elif status in ['cc_new', 'cc_ok']:
            node = self.nodes[session['node']]
            if node is None:
                raise bottle.HTTPError(500)
            config = node.config
            if config.file.readonly is True:
                raise bottle.HTTPError(403)

            # translate unmod cookie & password indicator into cookie / password value from config
            if password == session['edit_unmod']:
                password = config.password or ''
            if cookie == session['edit_unmod']:
                cookie = config.cookie or ''

        else:
            raise bottle.HTTPError(403)

        config.label = label if len(label) > 0 else None
        config.control = control
        config.host = host
        config.port = port
        config.password = password if len(password) > 0 else None
        config.cookie = cookie if len(cookie) > 0 else None

        config.tick()

        return bottle.HTTPResponse(status=200)

    def post_edit_node(self, session):

        unmod = uuid.uuid4().hex
        session['edit_unmod'] = unmod

        node = self.nodes.get(session['node'])
        config = node.config

        address = config.host
        if config.port is not None:
            address = f'{address}:{config.port}'

        data = {
            'unmod': unmod,
            'label': config.label,
            'connect': config.control,
            'address': address
        }

        if config.password is not None:
            data['pwd'] = unmod

        cookie = config.cookie
        if cookie is not None:
            if len(cookie) == 22:
                data['cookie'] = f'{cookie[:6]}...'
            else:
                # cookie length shall (always) be 22 characters!
                # All other lengths are invalid cookie values!
                data['cookie'] = cookie

        return json.JSONEncoder().encode({'config': data})

    def post_remove_node(self, session):

        node_id = session['node']
        node = self.nodes.get(node_id)
        config = node.config

        if config.readonly is True:
            return bottle.HTTPError(403)

        # get the name of the section that shall be removed
        section_name = config.name
        # here we collect all sessions representing this configuration section
        sessions = []

        # check all sessions, if they are connected to this section
        for s in self.sessions:
            n = self.nodes.get(s['node'])
            if n.config.name == section_name:
                sessions.append(s.id)

        print(f"ID'd sessions: {len(sessions)}")

        # delete all sessions identified!
        for s in sessions:
            self.sessions.delete_session_by_id(s)

        # now remove the node!
        self.nodes.node_remove(node_id)

        # and finally delete the section from the config file!
        if config.remove() is True:
            config.tick()
            return bottle.HTTPResponse(status=200)

        return bottle.HTTPError(500)

    def post_cc_ping(self, session):

        import traceback

        headers = {
            'Last-Modified': time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime(self.cc.last_modified))
            , 'Date': time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime())
        }

        # ping shall always send 'If-Modified-Since' header ...
        ims = bottle.request.environ.get('HTTP_IF_MODIFIED_SINCE', None)
        if ims is None:
            # As said: ping shall always send I-M-S
            return bottle.HTTPError(400)

        ims = bottle.parse_date(ims.split(";")[0].strip())
        if ims >= int(self.cc.last_modified):
            return bottle.HTTPResponse(status=304, **headers)

        # set the headers
        for header, value in headers.items():
            # print(header, value)
            bottle.response.set_header(header, value)

        # ['cards'] holds the session.id's for the cards of this session
        if session['cards'] is None:
            # First Card = DefaultNode
            card = self.sessions.create_session(bottle.request, 'cc_new')
            card['node'] = 'theonionbox'
            session['cards'] = [card.id]

            # if the frame (cc) session knows a password, this is the one for the default node!
            card['password'] = session.get('password', None)

        cards = [session['cards'][0]]

        # walk through the sections defined in the cc configuration file
        for section in self.cc:

            # The session = card representing this section
            card = None

            # the card's node
            node = None

            # check if there's a card = session, that holds a node with the name of this configuration section
            for card_id in session['cards']:
                s = self.sessions.get_session(card_id, bottle.request)
                if s is not None:
                    # If s IS None, the session is expired!
                    node = self.nodes[s['node']]
                    if section.name == node.config.name:
                        card = s
                        break

            if card is not None:
                # if the config changed...
                if int(section.last_modified) > ims:
                    # disco the node
                    node = self.nodes[card['node']]
                    node.disconnect()

                    # and delete the session = card
                    self.sessions.delete_session(card)
                    card = None

                    # card will now be recreated & node reconnected

            # If there's None, create a new session = a new card
            if card is None:

                # get the node representing this section
                node = self.nodes.get_name(section.name)

                # if node is None: create it from section!
                if node is None:
                    id = self.nodes.node_add(section)
                    node = self.nodes.get(id)

                # then create a new session & connect both
                if node is not None:
                    card = self.sessions.create_session(bottle.request, 'cc_new')
                    if card is not None:
                        card['node'] = node.id
                        card['controlled_by'] = session.id
                        card['password'] = section.password

                        # session['cards'].append(card.id)

            if card is not None:
                cards.append(card.id)

        # This eliminates all expired sessions from ['cards']
        session['cards'] = cards

        # Now json everything... and return it!
        return json.JSONEncoder().encode({'cards': cards})

    def post_cc_ciao(self, session):
        log = logging.getLogger('theonionbox')
        log.debug("Card {} sent a 'Ciao'!".format(session.id_short))
        self.sessions.delete_session(session)

    def post_cc_data(self, session):

        headers = dict()

        # data shall always send 'If-Modified-Since' header ...
        ims = bottle.request.environ.get('HTTP_IF_MODIFIED_SINCE')

        headers['Last-Modified'] = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime(time.time()))
        headers['Date'] = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime())

        if ims:
            ims = bottle.parse_date(ims.split(";")[0].strip())

        #print(session['node'])

        # print(session.id + ' / position -> ')

        try:
            node = self.nodes[session['node']]
        except KeyError:
            self.sessions.delete_session(session)
            raise bottle.HTTPError(400)

        status = session['status']

        # print(status)
        if status != 'cc_ok':

            # if node.config.connect is False:
            #     return bottle.HTTPResponse(202)    # Accepted

            # This raises in case of issues
            self.connect_card_to_node(session, node)

            # Being here there's a valid connection!
            session['status'] = 'cc_ok'

        if node.controller and not node.controller.is_alive():
            # Try to reconnect - once!
            node.controller.reconnect()

        # This is an issue...
        if not node.controller or not node.controller.is_alive():
            raise bottle.HTTPError(404)

        # ...

        ret = {}

        # create an uuid unique to a fp
        # to allow the cc client to distinguish cards for cumulation
        fp = None
        with contextlib.suppress(Exception):
            fp = node.controller.fingerprint

        if fp is not None and len(fp) == 40:
            if fp not in self.fingerprints:
                self.fingerprints[fp] = uuid.uuid4().hex
            ret['representing'] = self.fingerprints[fp]

        # ret['style'] = 'readonly'
        ret['dd'] = ''

        ret['label'] = node.nickname
        ret['version'] = node.controller.version_short

        # if ims and ims < self.vm.Tor.last_modified:
        ret['latest'] = self.version.Tor.stable

        # ret['latest'] = '0.4.0.6'
        ret['versionflag'] = node.controller.version_current

        node_mode = 'Client'
        if node.controller.get_conf('BridgeRelay', None) == '1':
            node_mode = 'Bridge'
        elif node.controller.get_conf('ORPort', None):
            node_mode = 'Relay'
        ret['mode'] = node_mode


        if True == True:

            # the first flag is always the placeholder for the nodes mode data
            # ret['flags'] = ['mode']
            ret['flags'] = []

            if node_mode == 'Bridge':
                # node.controller.flags fails for a bridge!
                try:
                    oo = node.onionoo
                    d = oo.details('flags')
                    ret['flags'].extend(d)
                except:
                    pass
            else:
                f = node.controller.flags
                if f is not None and len(f) > 0 and f[0] != 'unknown':
                    ret['flags'].extend(f)

            # We add an icon in case of Hibernation!
            try:
                accs = node.controller.get_accounting_stats()
            except:
                pass
            else:
                if accs.status != "awake":
                    ret['flags'].append(accs.status)

        else:

            ret['flags'] = [
                'mode',
                'Authority',
                'BadExit',
                'BadDirectory',
                'Exit',
                'Fast',
                'Guard',
                'HSDir',
                'Named',
                'Stable',
                'Running',
                'Unnamed',
                'Valid',
                'V2Dir',
                'V3Dir',
                'soft',
                'hard',
                'unknown'
            ]

        ret['details'] = True

        last_ts = session['lastTS']

        rv = node.bandwidth.get_data(interval='1s', since_timestamp=last_ts)
        # print(len(rv))
        if len(rv) > 0:
            ret['bw'] = rv

        session['lastTS'] = time.time() * 1000

        # Connection
        conn = ''
        conn += 'h' if node.config.is_default_node else ''
        conn += 'p' if node.controller.auth_password else ''
        conn += 'c' if node.controller.with_cookie else ''
        conn += 'x' if node.controller.via_proxy else ''
        ret['conn'] = conn

        # set the headers
        for header, value in headers.items():
            # print(header, value)
            bottle.response.set_header(header, value)

        return json.JSONEncoder().encode(ret)

    def connect_card_to_node(self, session_of_card: Session, node: Node):

        from stem.connection import MissingPassword, IncorrectPassword

        try:
            super().connect_session_to_node(session_of_card, node.id)
        except (MissingPassword, IncorrectPassword):

            session_of_card['auth'] = 'basic' if node.controller.password is None else 'digest'

            label = node.label or ''
            version = self.latest_pi.tor_version.version_str if self.latest_pi is not None else ''

            origin = 'Tor/' + version + '/' + label
            raise CCError(401, origin=origin)    # Unauthorized

        except bottle.HTTPError:
            raise
        except Exception as exc:
            raise bottle.HTTPError(404)

    def post_cc_connect(self, session):

        try:
            node = self.nodes[session['node']]
        except KeyError:
            self.sessions.delete_session(session)
            raise bottle.HTTPError(400)

        # This raises in case of issues
        self.connect_card_to_node(session, node)

        # Being here there's a valid connection!
        session['status'] = 'cc_ok'

    def post_cc_login(self, session):

        from tob.authenticate import authenticate
        import traceback

        # print("post_cc_login")

        if 'login' in session:
            session['login'] += 1
            if session['login'] > 1 or (time.time() - session['login_time']) > 1.5:
                self.sessions.delete_session(session)
                raise bottle.HTTPError(404)
        else:
            session['login'] = 0
            session['login_time'] = time.time()

        node = self.nodes[session['node']]
        header = bottle.request.environ.get('HTTP_AUTHORIZATION', '')

        # print(header)

        # this raises HTTPError(401) to perform the authentication procedure
        pwd = authenticate(session, node, header, method='POST')

        # at this stage we have a successful login
        # and switch to standard session management

        # Cerate new session
        authed_session = self.sessions.create_session(bottle.request, 'cc_new')
        if authed_session is not None:

            # Fill it with initial data
            authed_session['node'] = node.id
            authed_session['password'] = pwd

            # Replace current session against authed_session in the controlcenter's session['cards']:
            # Find the cc's session
            cc = None
            with contextlib.suppress(Exception):
                cc = self.sessions.get_session(session['controlled_by'], bottle.request)

            # if found, get the ['cards'] and exchange the .id's
            if cc is not None:
                cards = cc['cards']
                cards.remove(session.id)
                cards.append(authed_session.id)

                # register the controlcenter's .id in the authed_session
                # ... to enable exactly this procedure
                authed_session['controlled_by'] = cc.id

                # delete the unauthed session
                self.sessions.delete_session(session)

                # and finally tell the client the new id!
                return authed_session.id

        # This is the uuups case...
        return bottle.HTTPError(404)

    def get_md5(self, session):
        self.redirect(f'/{session.id}/md5.js')

    def get_cc_logout(self, session):
        print('@logout')
        self.sessions.delete_session(session)
        self.redirect('/')

    def get_details(self, session):
        # We use the dashboards 'get_restart' ('/<session_id>/') function to show the detail page
        # => Adequately fill the session, so that 'restart' likes it:

        details_session = self.sessions.create_session(bottle.request, 'login')
        details_session['password'] = session.get('password')
        details_session['cached_node'] = session.get('node')

        self.redirect(f'/{details_session.id}/')

    def post_position(self, session):

        # When the operator changes the position of a card via D & D,
        # it sends the session id of the card located before itself in the DOM tree.

        from tob.ccfile import CCNode

        before = bottle.request.forms.get('position', None)
        if before is None:
            return

        b = self.sessions.get_session(before, bottle.request)
        if b is None:
            return

        before_node = self.nodes[b['node']]
        session_node = self.nodes[session['node']]

        if before_node is not None and session_node is not None:

            bnc = before_node.config

            if not isinstance(bnc, CCNode):
                bnc = None

            session_node.config.move_after(bnc)

    def post_cc_edit(self, session):

        n = session['node']
        c = n.config

        data = {'control': c.control}

        if c.host is not None and c.port is not None:
            data['port'] = f'{c.host}:{c.port}'

        if c.socket is not None:
            data['socket'] = c.socket

        data = {
            'control': c.control,
            'port': 'xxx'
        }

    def post_cc_license(self, session):

        from tob.license import License

        l = License()

        license = f"""
            <div style='font-family: LatoLatinWebLight; font-size: 24px;'>The Onion Box</div>
            <div style='font-family: LatoLatinWeb; font-size: 14px;'>{l.get('copyright')}</div>
            <div style='font-family: LatoLatinWeb; font-size: 14px;'>{l.get('1')}</div>
            <br>
            <div style='font-family: LatoLatinWeb; font-size: 14px;'>{l.get('2')}</div>
            <br>
            <div style='font-family: LatoLatinWeb; font-size: 14px;'>{l.get('3')}</div>
            <br>
            <div style='font-family: LatoLatinWebLight; font-size: 24px;'>Statement of Independence</div>
            <div style='font-family: LatoLatinWeb; font-size: 14px;'>{l.get('independence')}</div>
        """

        return license

    def post_cc_about(self, session):

        from stamp import __version__, __stamp__

        Credits = [
            ('Bootstrap', 'https://getbootstrap.com', 'The Bootstrap team', 'MIT'),
            ('Bottle', 'http://bottlepy.org', 'Marcel Hellkamp', 'MIT'),
            ('Cheroot', 'https://github.com/cherrypy/cheroot', 'CherryPy Team',
             'BSD 3-Clause "New" or "Revised" License'),
            ('Click', 'https://github.com/pallets/click', 'Pallets', 'BSD 3-Clause "New" or "Revised" License'),
            ('ConfigUpdater', 'https://github.com/pyscaffold/configupdater', 'Florian Wilhelm', 'MIT'),
            ('Glide', 'https://github.com/glidejs/glide', '@jedrzejchalubek', 'MIT'),
            ('JQuery', 'https://jquery.com', 'The jQuery Foundation', 'MIT'),
            ('jquery.pep.js', 'http://pep.briangonzalez.org', '@briangonzalez', 'MIT'),
            ('js-md5', 'https://github.com/emn178/js-md5', '@emn178', 'MIT'),
            ('PySocks', 'https://github.com/Anorov/PySocks', '@Anorov', 'Custom DAN HAIM'),
            ('RapydScript-NG', 'https://github.com/kovidgoyal/rapydscript-ng', '@kovidgoyal',
             'BSD 2-Clause "Simplified" License'),
            ('Requests', 'https://requests.kennethreitz.org', 'Kenneth Reitz', 'Apache License, Version 2.0'),
            ('scrollMonitor', 'https://github.com/stutrek/scrollmonitor', '@stutrek', 'MIT'),
            ('Smoothie Charts', 'https://github.com/joewalnes/smoothie', '@drewnoakes', 'MIT'),
            ('stem', 'https://stem.torproject.org', 'Damian Johnson and The Tor Project',
             'GNU LESSER GENERAL PUBLIC LICENSE')
        ]

        cdts = ''
        for line in Credits:
            (project, url, author, license) = line
            cdts += f'<a href="{url}" target="_blank"><b>{project}</b></a> &copy; {author} | {license}<br>'

        cdts += '<br><b>... and a number of others more!</b>'

        about = f"""
            <div style='font-family: LatoLatinWeb; font-size: 24px;'>
                The Onion Box <span style='font-family: LatoLatinWeb; font-size: 18px;'> {__version__}
            </div>
            <div style='font-family: LatoLatinWebLight; font-size: 18px;'>Dashboard to monitor Tor node operations</div>
            <hr>
            <div style='font-family: LatoLatinWebLight; font-size: 14px;'>
                <a href="http://www.theonionbox.com/#readme" target="_blank">The Onion Box</a>
                 | Copyright &copy; 2015 - 2019 Ralph Wetzel | License:
                <a href="https://github.com/ralphwetzel/theonionbox/blob/master/LICENSE" target="_blank">MIT</a>
            </div>
            <div style='font-family: LatoLatinWebLight; font-size: 14px;'>
                Tor and the Tor Onion Logo are registered trademarks &reg of
                <a href="https://torproject.org" target="_blank">The Tor Project</a>.
                Onionoo is a service of The Tor Project.
            </div>
            <div style='font-family: LatoLatinWebLight; font-size: 14px;'>
                The Onion Box uses the great <a href="https://latofonts.com" target="_blank">Lato</a> font. | Copyright
                Łukasz Dziedzic | License:
                <a href="http://scripts.sil.org/OFL" target="_blank">SIL Open Font License 1.1</a>.
            </div>
            <div style='font-family: LatoLatinWebLight; font-size: 14px;'>
                Icons from <a href="https://fontawesome.com" target="_blank">Font Awesome Free</a> | Copyright
                @fontawesome | <a href="https://fontawesome.com/license/free" target="_blank">
                License</a> @ Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT.
            </div>
            <hr>
            <div style='font-family: LatoLatinWeb; font-size: 18px;'>Credits</div>
            <div style='font-family: LatoLatinWebLight; font-size: 14px;'>
                The Onion Box benefits from the contribution of the following open source software projects.
                Thank you so much!
                <br>
            </div>
            <div style="margin: 5px">
                <div class="crawl" style="overflow-y:auto; max-height: 116px; 
                    font-family: LatoLatinWebLight; font-size: 14px;">
                    {cdts}
                </div>
            </div>
        """

        return about
