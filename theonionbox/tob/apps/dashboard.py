import contextlib
import uuid
import json

from threading import Timer
from typing import Optional

from bottle import Bottle, HTTPError, request, template, static_file

from tob.apps import BaseApp
from tob.geoip import GeoIPOO
from tob.nodes import Manager as NodesManager, Node
from tob.onionoo import getOnionoo
from tob.plugin import SessionPlugin
from tob.proxy import Proxy
from tob.session import SessionManager, Session, make_short_id
from tob.system import BaseSystem
from tob.utils import AttributedDict
from tob.version import VersionManager
# from tob.scheduler import Scheduler

class Dashboard(BaseApp):

    def __init__(self
                 , sessions: SessionManager
                 , nodes: NodesManager
                 , proxy: Proxy
                 , version: VersionManager
                 , config: AttributedDict
                 , system: BaseSystem
                 , geoip: GeoIPOO):

        super().__init__(sessions=sessions, nodes=nodes, proxy=proxy, version=version,
                         config=config)

        self.system = system

        # #####
        # # GeoIP2 interface
        self.geoip2 = geoip

        # Will be overwritten if we operate a ControlCenter
        self.default_page = "index.html"

        #####
        # TOR manpage Index Information
        from tob.manpage import ManPage
        self.manpage = ManPage('tor/tor.1.ndx')

        #####
        # Page Construction
        #
        # '!' as first character creates a named div
        # '-' as entry adds a <hr>

        # The sections of the index page
        self.sections = ['!header', 'header',
                         '!content', 'host',
                         'config',
                         'hiddenservice', 'local',
                         'network', 'network_bandwidth', 'network_weights', '-',
                         'accounting', 'monitor',
                         # 'family',
                         'control', 'messages',
                         'license']

        #####
        # The routing table

        config = {
            'no_session_redirect': self.redirect.path('/')
        }

        self.app.route('/',
                       method='GET',
                       callback=self.get_start,
                       **config)

        self.app.route('/<session_id>/',
                       method='GET',
                       callback=self.get_restart,
                       **config)

        self.app.route('/<session_id>/failed.html',
                       method='GET',
                       callback=self.get_failed,
                       **config)

        config['valid_status'] = ['ok', 'auto']

        self.app.route('/<login_id>/login.html',
                       method='GET',
                       callback=self.perform_login,
                       **config)

        self.app.route('/<session_id>/logout.html',
                       method='GET',
                       callback=self.get_logout,
                       **config)

        self.app.route('/<session>/index.html',
                       method='GET',
                       callback=self.get_index,
                       **config)

        config = {
            'valid_status': ['ok', 'auto']
        }

        self.app.route('/<session>/data.html',
                       method='POST',
                       callback=self.post_data,
                       **config)

        config = {}

        self.app.route('/<session>/manpage.html',
                       method='GET',
                       callback=self.get_manpage,
                       **config)

        # config = {
        #     'valid_status': ['cc_ok']
        # }
        #
        # self.app.route('/<session>/details',
        #                method='GET',
        #                callback=self.get_details,
        #                **config)

        # def debug_request():
        #     self.log.debug(request.environ['PATH_INFO'])
        #
        # # Log connection requests...
        # self.app.add_hook('before_request', debug_request)

        # Plugin for session management
        self.app.install(SessionPlugin(self.sessions))

    # Default Landing Page
    def get_start(self):

        session = self.sessions.create_session(request, 'login')

        if session is None:
            raise HTTPError(404)

        return self.connect_session_to_node(session, 'theonionbox', proceed_to_page=self.default_page)

    def connect_session_to_node(self, session: Session, node_id: str, proceed_to_page: Optional[str] = None):

        from stem.connection import MissingPassword, IncorrectPassword

        if proceed_to_page is None:
            proceed_to_page = self.default_page

        try:
            super().connect_session_to_node(session, node_id)
        except (MissingPassword, IncorrectPassword):
            return self.create_login_page(session, self.nodes[node_id], proceed_to_page)
        except HTTPError:
            raise
        except Exception as exc:
            return self.create_error_page(session, exc)

        session['status'] = 'auto'  # this indicates that there is no login necessary; therefore no logout possible!
        self.redirect(f'/{session.id}/{proceed_to_page}')

    def create_error_page(self, session: Session, display_error: BaseException):

        self.log.info(f'Session {make_short_id(session.id)}: Error Page @ "{display_error}"')

        # The sections of the error page
        error_sections = ['!header', 'header', '!content', 'error', 'license']

        # We failed to connect to Tor and have to admit this now!
        session['status'] = 'error'

        session['stylesheets'] = ['bootstrap.css', 'latolatin/latolatinfonts.css', 'box.css']
        session['scripts'] = ['jquery.js', 'bootstrap.js', 'box.js']

        section_config = {}
        section_config['header'] = {
            'logout': False,
            'title': 'The Onion Box',
            'subtitle': "Version: {}<br>Your address: {}".format(self.config.stamped_version, request.get('REMOTE_ADDR'))
        }

        params = {
            'session': session
            , 'tor': None
            , 'session_id': session.id
            , 'icon': self.icon
            , 'box_stamp': self.config.stamped_version
            , 'virtual_basepath': self.config.box.base_path
            , 'sections': error_sections
            , 'section_config': section_config
            , 'error_msg': display_error
            , 'box.js_login': True  # flag to manipulate the creation process of 'box.js'
        }

        # prepare the includes
        session['box.js'] = template('scripts/box.js', **params)
        session['box.css'] = template('css/box.css', **params)
        # session['fonts.css'] = template('css/latolatinfonts.css', **params)

        # deliver the error page
        return template("pages/index.html", **params)

    def create_login_page(self, session: Session, node: Node, proceed_to_page: str):

        self.log.debug('Session {} o-A-o {} Node'.format(session.id, node.id))

        # The sections of the login page
        login_sections = ['!header', 'header', '!content', 'login', 'license']

        # Standard login Page delivery
        session['auth'] = 'digest' if node.controller.password is not None else 'basic'

        session['stylesheets'] = ['bootstrap.css', 'latolatin/latolatinfonts.css', 'box.css']
        session['scripts'] = ['jquery.js', 'bootstrap.js', 'auth.js', 'box.js']

        section_config = {}
        section_config['header'] = {
            'logout': False,
            'title': 'The Onion Box',
            'subtitle': "Version: {}<br>Your address: {}".format(self.config.stamped_version, request.get('REMOTE_ADDR'))
        }
        section_config['login'] = {
            # 'timeout': self.config.box.ttl * 1000  # js!
            'timeout': 20 * 1000  # js!
        }

        params = {
            'session': session
            , 'tor': node.controller
            , 'session_id': session.id
            , 'icon': self.icon
            , 'box_stamp': self.config.stamped_version
            , 'virtual_basepath': self.config.box.base_path
            , 'sections': login_sections
            , 'section_config': section_config
            , 'proceed_to': proceed_to_page
            , 'box.js_login': True  # flag to manipulate the creation process of 'box.js'
        }

        # prepare the includes
        session['box.js'] = template('scripts/box.js', **params)
        session['box.css'] = template('css/box.css', **params)

        if 'auth' in session:
            if session['auth'] == 'basic':
                session['auth.js'] = template('scripts/authrequest_basic.js'
                                              , virtual_basepath=self.config.box.base_path
                                              , proceed_to = proceed_to_page
                                              , session_id=session.id)
            else:  # e.g. if login['auth'] == 'digest'
                session['auth.js'] = template('scripts/authrequest_digest.js'
                                              , virtual_basepath=self.config.box.base_path
                                              , proceed_to = proceed_to_page
                                              , session_id=session.id)
                session['scripts'].append('md5.js')

        # deliver the login page
        return template("pages/index.html", **params)

    def get_restart(self, session_id):

        # When monitoring a controlled node, this is the default landing page
        # in case of login error or logout procedure

        # The CC uses this as well to launch the detail page delivery.

        session = self.sessions.get_session_without_validation(session_id)

        if session is None:
            self.redirect('/')

        status = session.get('status')
        if status != 'login':
            self.redirect('/')

        # session shall already be a newly created one, status 'login'
        # carrying in 'cached_node' the id of the node formerly connected to (or intending to log into)

        node_id = session.get('node')
        cached_id = session.get('cached_node')

        # 'node_id is not None' indicates that the session already went through a 'connect_session_...' cycle
        # This happens when the user reloads the page after a failed attempt to login
        # => Restart with a fresh session

        # session might be expired! In that case, we create a new session and restart

        if node_id is not None or session.expired:
            self.sessions.delete_session(session)
            new_session = self.sessions.create_session(request, 'login')
            new_session['cached_node'] = node_id
            self.redirect(f'/{new_session.id}/')

        if cached_id is None:
            self.sessions.delete_session(session)
            self.redirect('/')

        return self.connect_session_to_node(session, cached_id, proceed_to_page="index.html")

    #####
    #  The Authentication System

    def perform_login(self, login_id):

        from tob.authenticate import authenticate

        self.log.debug(f'Login Request: {make_short_id(login_id)}@{request.remote_addr} / {request.remote_route}')

        # boxLog.debug("{}@{} requests '{}'".format(make_short_id(login_id), request.remote_addr, 'login.html'))
        # boxLog.debug(
        #     "{}: addr = {} / route = {}".format(make_short_id(login_id), request.remote_addr, request.remote_route))

        session = self.sessions.get_session(login_id, request)

        if session is None:
            self.redirect('/')

        # print(session['status'])

        if session['status'] != 'login':
            self.sessions.delete_session(session)
            self.redirect('/')

        node = None
        try:
            node = self.nodes.get(session['node'])
        except:
            self.sessions.delete_session(session)
            self.redirect('/')

        if 'login' in session:
            session['login'] += 1
            if session['login'] > 1 or (self.time() - session['login_time']) > 1.5:
                self.sessions.delete_session(session)
                raise HTTPError(404)
        else:
            session['login'] = 0
            session['login_time'] = self.time()

        header = request.environ.get('HTTP_AUTHORIZATION', '')

        # this raises HTTPError(401) to perform the authentication procedure
        pwd = authenticate(session, node, header)

        # at this stage we have a successful login
        # and switch to standard session management
        self.sessions.delete_session(session)

        authed_session = self.sessions.create_session(request, 'prepared')
        if authed_session is not None:
            authed_session['node'] = node.id
            authed_session['prep_time'] = self.time()
            authed_session['password'] = pwd

            return authed_session.id

        raise HTTPError(404)

    def get_failed(self, session_id):
        session = self.sessions.get_session_without_validation(session_id)

        if session is not None:
            node_id = session.get('node')
            self.log.notice(f'{session.id_short()}@{request.remote_addr}: Login failed.')
            self.sessions.delete_session(session)

            new_session = self.sessions.create_session(request, 'login')
            new_session['cached_node'] = node_id

            self.redirect('/' + new_session.id + '/')

        self.log.warning(f"Unknown client @ 'failed.html': {make_short_id(session_id)}@{request.remote_addr}")
        self.redirect('/')

    # This is the standard page!
    def get_index(self, session):

        status = session['status']

        if status == 'prepared':

            delay = self.time() - session['prep_time']

            if delay > 2.0:  # seconds
                session['status'] = 'toolate'  # ;)
                self.log.warning(f'{session.id_short()}: Login to Session delay expired. Session canceled.')
            else:
                session['status'] = 'ok'
                # we have a successfull connection! Celebrate this!
                self.log.notice(f'{session.id_short()}: Session established.')

        if session['status'] not in ['ok', 'auto']:
            self.sessions.delete_session(session)
            self.redirect('/')

        try:
            node = self.nodes.get(session['node'])
        except Exception:
            self.sessions.delete_session(session)
            self.redirect('/')

        tor = node.controller
        fingerprint = tor.fingerprint

        if self.verify_fingerprint(fingerprint) is True:
            oo = getOnionoo()
            oo.trigger(fingerprint)

        # reset the time flags!
        del session['cpu']
        del session['accounting']
        del session['monitor']
        del session['network']
        del session['network_bw']
        del session['network_weights']
        del session['family']

        # setup the MessageHandler for this session
        # node.torLogMgr.add_client(session.id)

        # prepare the preserved events for hardcoded transfer
        from tob.log import sanitize_for_html
        # p_ev = node.torLogMgr.get_events(session.id, encode=sanitize_for_html)
        p_ev = []

        accounting_stats = {}
        try:
            accounting_stats = tor.get_accounting_stats()
            accounting_switch = True
        except:
            accounting_switch = False

        #####
        # Page Construction
        #
        # '!' as first character creates a named div
        # '-' as entry adds a <hr>

        # !header
        #   header
        # !content
        #   host
        #   config
        #   hiddenservice
        #   local
        #   network
        #       network_bandwidth
        #       network_weights
        #       -
        #   accounting
        #   monitor
        #   family
        #   control
        #   messages
        #   license

        sections = ['!header', 'header',
                    '!content']

        # sections += ['controlcenter']

        if tor.is_localhost():
            sections += ['host']

        sections += ['config']

        hsc = tor.get_hidden_service_conf(None)
        if hsc is not None and len(hsc) > 0:
            sections += ['hiddenservice']

        sections += ['local']

        params = {}

        sections_oo = []
        # with contextlib.suppress(AttributeError):

        if node.onionoo is not None and node.onionoo.details.has_data():
            sections_oo += ['network']
            params['oo_details'] = node.onionoo.details

            if node.onionoo.bandwidth.has_data():
                sections_oo += ['network_bandwidth']
                params['oo_bw'] = node.onionoo.bandwidth

            if node.onionoo.weights.has_data():
                sections_oo += ['network_weights']
                params['oo_weights'] = node.onionoo.weights

        if len(sections_oo) > 0:
            sections_oo += ['-']  # <hr>

        sections += sections_oo

        if accounting_switch is True:
            sections += ['accounting']

        sections += ['monitor']

        sections += ['transport']

        # this is for testing purposes only
        # sections += ['nodes', 'transport']

        # if fingerprint:
        #     sections.append('family')

        sections += ['messages']

        sections += ['license']

        session['sections'] = sections

        session['stylesheets'] = ['bootstrap.css', 'latolatin/latolatinfonts.css', 'glide.core.css', 'glide.theme.css']
        session['scripts'] = ['jquery.js', 'bootstrap.js', 'smoothie.js', 'chart.js', 'scrollMonitor.js', 'glide.js']

        # to ensure, that 'box.xxx' is the latest element...
        session['stylesheets'].append('box.css')
        session['scripts'].append('box.js')

        import socket

        if tor.is_localhost() is True:
            at_location = socket.gethostname()
        else:
            try:
                at_location = tor.get_info('address')
            except:
                at_location = 'Remote Location'

        section_config = {}
        section_config['header'] = {
            'logout': session['status'] != 'auto' or session['password'] is not None,
            'title': tor.nickname,
            'subtitle': f"Tor {tor.version_short} @ {at_location}<br>{fingerprint}",
            'powered': f"monitored by <b>The Onion Box</b> v{self.config.stamped_version}"
        }

        def get_lines(info):
            info_lines = info.split('\n')
            return len(info_lines)

        transport = {
            'or': get_lines(tor.get_info('orconn-status')),
            'stream': get_lines(tor.get_info('stream-status')),
            'circ': get_lines(tor.get_info('circuit-status')),
        }

        # This is the initial session token
        session['token'] = uuid.uuid4().hex

        # Marker for the map
        icon_marker = "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAA" \
                      "DsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAC9SURBVDhPpZK9DcJADIVTUFBcmTXo" \
                      "KTNAxqFIiRR6RonEAhQMQUmRMSiO90U2csSBAhSfdLbf8/25yjk/OWxOSXRiEKPBmlyK2mhqxE3kN1BrZkYSQXARragN1mdB" \
                      "7S62k1ELjuc7HcXKuzrkRG+aq1iT5Py+04sporrvvCPg8gRtSRxBY9qBgJcjqEviCBrTjn8Zfz6qPw4XX/o4HUH8jr5kANX2" \
                      "pkGbPBkHgK6fBmCantjx+5EL5oVDnqsHL/DYhRMxwWIAAAAASUVORK5CYII="

        # params initialized before for onionoo data
        params.update({
            'session': session
            # , 'read_bytes': node.bwdata['download']
            # , 'written_bytes': node.bwdata['upload']
            , 'tor': tor
            , 'host': self.system
            , 'session_id': session.id
            , 'preserved_events': p_ev
            , 'server_time': self.time()
            , 'accounting_on': accounting_switch
            , 'accounting_stats': accounting_stats
            , 'icon': self.icon
            , 'marker': icon_marker
            , 'box_stamp': self.config.stamped_version
            , 'box_debug': False    # ToDo: Adjust to config.debug!!
            , 'boxVersion': self.version
            , 'virtual_basepath': self.config.box.base_path
            , 'sections': sections
            , 'manpage': self.manpage
            # , 'oo_show': onionoo_show
            # , 'oo_details': node.onionoo.details()
            # , 'oo_bw': node.onionoo.bandwidth()
            # , 'oo_weights': node.onionoo.weights()
            , 'section_config': section_config
            # , 'oo_factory': node.onionoo
            , 'geoip': self.geoip2
            , 'family_fp': fingerprint
            # , 'controlled_nodes': box_cc
            , 'transport_status': transport
            , 'token': session['token']

        })

        # Test
        #    from bottle import SimpleTemplate
        #    tpl = SimpleTemplate(name='scripts/box.js')
        #    tpl.prepare(syntax='/* */ // {{ }}')
        #    bjs = tpl.render(**params)

        # re-ping the session - to prevent accidential timeout
        self.sessions.get_session(session.id, request)

        # prepare the includes
        session['box.js'] = template('scripts/box.js', **params)
        session['box.css'] = template('css/box.css', **params)
        # session['fonts.css'] = template('css/latolatinfonts.css', **params)

        # create the dashboard
        index = template("pages/index.html", **params)

        # re-ping the session - to prevent accidential timeout
        self.sessions.get_session(session.id, request)

        # deliver the dashboard
        return index

    def post_data(self, session):

        session_id = session.id

        node = None
        tor = None

        # Session token verification
        token = request.forms.get('token', None)
        if token is None or token != session['token']:
            self.sessions.delete_session(session)
            self.log.warning("Token mismatch at session {}. Session closed.".format(session.id_short()))
            raise HTTPError(404)

        if session['status'] in ['ok', 'auto']:
            try:
                node = self.nodes[session['node']]
                tor = node.controller
            except:
                raise HTTPError(404)
            fp = tor.fingerprint
        elif session['status'] in ['search']:
            fp = session['search']
        else:
            raise HTTPError(503)

        # create new session token
        session['token'] = uuid.uuid4().hex

        its_now = int(self.time()) * 1000  # JS!

        return_data_dict = {'tick': its_now}

        box_sections = session['sections']

        # host
        if 'host' in box_sections:

            since = session['cpu'] if 'cpu' in session else None
            cpu_list = self.system.get_performance_data(after=since)

            # this little hack ensures, that we deliver data on the
            # first *two* calls after launch!
            session['cpu'] = its_now if 'cpu' in session else 0

            if len(cpu_list) > 0:
                return_data_dict['gen'] = cpu_list

        # accounting
        if 'accounting' in box_sections:

            from stem import ControllerError

            accs = None

            try:
                accs = tor.get_accounting_stats()
                ret = accs.retrieved

                # to compensate for 'Object of type datetime is not JSON serializable' error
                accs = accs._replace(interval_end=accs.interval_end.timestamp())
                # our JS script needs the field names...
                accs = accs._asdict()

            except ControllerError:
                ret = its_now

            acc = {'enabled': accs is not None}

            if accs is not None:
                acc['stats'] = accs

            session['accounting'] = ret     # currently not used!
            return_data_dict['acc'] = acc

        # messages
        if 'messages' in box_sections:
            runlevel = request.forms.get('runlevel', None)

            if runlevel:

                rl_dict = json.JSONDecoder().decode(runlevel)

                # boxLog.debug('Levels from the client @ {}: {}'.format(session_id, rl_dict))

                for key in rl_dict:
                    changed = node.logs.switch(session_id, key, rl_dict[key])

                    # auto cancel 'DEBUG' mode after 30 seconds
                    if key == 'DEBUG' and rl_dict[key] and changed:
                        Timer(30,
                              node.logs.switch,
                              kwargs={'session_id': session_id,
                                      'level': key,
                                      'status': False}).start()

            from tob.log import sanitize_for_html
            log_list = node.logs.get_events(session_id, encode=sanitize_for_html)

            if log_list and len(log_list) > 0:
                return_data_dict['msg'] = log_list

            log_status = node.logs.get_status(session_id)
            if log_status is not None:
                return_data_dict['msg_status'] = log_status

        # get the onionoo data
        # onionoo_details = onionoo.details(fp)
        # onionoo_bw = onionoo.bandwidth(fp)
        # onionoo_weights = onionoo.weights(fp)

        # operations monitoring
        if 'monitor' in box_sections:

            from tob.livedata import intervals

            return_data_dict['mon'] = {}
            last_ts = None
            if 'monitor' in session:
                last_ts = session['monitor']
                if last_ts == 0:
                    last_ts = None

            for interval in intervals:
                try:
                    retval = node.bandwidth.get_data(interval=interval, since_timestamp=last_ts)
                    if len(retval) > 0:
                        return_data_dict['mon'][interval] = retval
                except Exception as e:
                    pass

            # if ('network_bw' not in session) or (session['network_bw'] == 0):
            #     res = {}
            #     obwr = node.onionoo.bandwidth.read()
            #     obww = node.onionoo.bandwidth.write()
            #     # obwr = None
            #     # obww = None
            #     if obwr is not None:
            #         res['read'] = obwr
            #     if obww is not None:
            #         res['write'] = obww
            #     if len(res) > 0:
            #         return_data_dict['mon']['oo_bw'] = res

            # this little hack ensures, that we deliver data on the
            # first *two* calls after launch!
            session['monitor'] = its_now if 'monitor' in session else 0

        # operations monitoring
        # if 'controlcenter' in box_sections:
        #
        #     return_data_dict['cc'] = {}
        #     last_ts = None
        #     if 'controlcenter' in session:
        #         last_ts = session['controlcenter']
        #         if last_ts == 0:
        #             last_ts = None
        #
        #     # try:
        #     #     retval = node.livedata.get_data(since_timestamp=last_ts)
        #     #     if len(retval) > 0:
        #     #         return_data_dict['cc']['1s'] = retval
        #     # except Exception as e:
        #     #     print(e)
        #     #     pass
        #
        #     retval = node.livedata.get_data(since_timestamp=last_ts)
        #     if len(retval) > 0:
        #         return_data_dict['cc']['1s'] = retval
        #
        #     # this little hack ensures, that we deliver data on the
        #     # first *two* calls after launch!
        #     session['controlcenter'] = its_now if 'cc' in session else 0

        if 'network' in box_sections:
            # Once there was code here.
            # It's no more ;) !
            pass

        if 'network_bandwidth' in box_sections:
            if ('network_bw' not in session) or (session['network_bw'] == 0):
                return_data_dict['oo_bw'] = {'read': node.onionoo.bandwidth.read(),
                                             'write': node.onionoo.bandwidth.write()}
                # this little hack ensures, that we deliver data on the
                # first *two* calls after launch!
                session['network_bw'] = node.onionoo.bandwidth.published() if 'network_bw' in session else 0
            elif session['network_bw'] != node.onionoo.bandwidth.published():
                del session['network_bw']
                # if there's new data act as if we've not had any before!
                # we'll therefore deliver the new data with the next run!

        if 'network_weights' in box_sections:
            if ('network_weights' not in session) or (session['network_weights'] == 0):

                details = {'cw': node.onionoo.details('consensus_weight'),
                           'cwf': node.onionoo.details('consensus_weight_fraction'),
                           'gp': node.onionoo.details('guard_probability'),
                           'mp': node.onionoo.details('middle_probability'),
                           'ep': node.onionoo.details('exit_probability')}

                return_data_dict['oo_weights'] = {'cw': node.onionoo.weights.consensus_weight(),
                                                  'cwf': node.onionoo.weights.consensus_weight_fraction(),
                                                  'ep': node.onionoo.weights.exit_probability(),
                                                  'gp': node.onionoo.weights.guard_probability(),
                                                  'mp': node.onionoo.weights.middle_probability(),
                                                  'data': details
                                                  }

                # print(return_data_dict['oo_weights'])

                # this little hack ensures, that we deliver data on the
                # first *two* calls after launch!
                session['network_weights'] = node.onionoo.weights.published() if 'network_weights' in session else 0
            elif session['network_weights'] != node.onionoo.weights.published():
                del session['network_weights']
                # if there's new data act as if we've not had any before!
                # we'll therefore deliver the new data with the next run!

        if 'family_xx' in box_sections:

            # get the family entries from the onionoo details of the node
            fp = tor.fingerprint
            family_details = onionoo.details(fp)

            if family_details is not None:

                # there are several different categories of families
                fams = ['effective_family', 'alleged_family', 'indirect_family']

                family_data = {}  # the read / write data for one node; key = fingerprint of node (pre 5.0: [1:])
                family_nodes = []  # list of fingerprints of the nodes (pre 5.0: [1:])

                if 'family' not in session:
                    session['family'] = {}

                session_family = session['family']

                # iterate through the categories
                for fam in fams:

                    # get the nodes per category
                    fam_det = family_details(fam)
                    if fam_det is not None:
                        # iterate through the nodes
                        for fp in fam_det:
                            # onionoo protocol v5.0 adaptation
                            node_fp = fp[1:] if fp[0] is '$' else fp
                            node_key = 'family:{}'.format(node_fp)
                            node_bw = onionoo.bandwidth(node_fp)

                            if node_bw is not None:
                                if (node_key not in session_family) or (session_family[node_key] == 0):
                                    family_nodes.append(node_fp)
                                    family_data[node_fp] = {'read': node_bw.read(), 'write': node_bw.write()}

                                    # this little hack ensures, that we deliver data on the
                                    # first *two* calls after launch!
                                    session_family[node_key] = node_bw.published() if node_key in session_family else 0

                                elif session_family[node_key] != node_bw.published():
                                    del session_family[node_key]
                                    # if there's new data act as if we've not had any before!
                                    # we'll therefore deliver the new data with the next run!

                # if we found some family entries
                if len(family_nodes) > 0:
                    # prepare the data
                    family_data['keys'] = family_nodes
                    return_data_dict['oo_family'] = family_data

        if 'transport' in box_sections:

            return_data_dict['transport'] = { 'or': node.connections.count,
                                              'circ': node.circuits.count,
                                              'stream': node.streams.count}

        #provide new session token
        return_data_dict['token'] = session['token']

        # Now json everything... and return it!
        return json.JSONEncoder().encode(return_data_dict)

    def get_logout(self, session_id):
        session = self.sessions.get_session_without_validation(session_id)

        if session is not None:
            node_id = session.get('node')
            self.log.notice(f'{session.id_short()}@{request.remote_addr}: Active LogOut!')
            self.sessions.delete_session(session)

            new_session = self.sessions.create_session(request, 'login')
            new_session['cached_node'] = node_id

            self.redirect(f'/{new_session.id}/')

        self.log.warning(f'LogOut requested from unknown client: {make_short_id(session_id)}@{request.remote_addr}')
        self.redirect('/')

    def get_manpage(self, session):
        return static_file('tor.1.html', root='tor', mimetype='text/html')