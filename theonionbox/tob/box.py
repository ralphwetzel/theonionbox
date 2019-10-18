import os
import sys

import stamp
import utils

import bottle

#####
# Python version detection
py = sys.version_info
py36 = py >= (3, 6, 0)

#####
# Stamping
stamped_version = '{} (stamp {})'.format(stamp.__version__, stamp.__stamp__)


class Box:
    def __init__(self, config):
        self.config = utils.AttributedDict(config)
        self.config['stamped_version'] = stamped_version

        #####
        # TOR manpage Index Information
        # from tob.manpage import ManPage
        # self.manpage = ManPage('tor/tor.1.ndx')

        #####
        # Host System data
        from tob.system import get_system_manager
        self.system = get_system_manager()

        #####
        # Logging System
        import logging
        import tob.log
        self.log = logging.getLogger('theonionbox')

        # We will Filter everything through the GlobalFilter
        # NOTSET + 1 just ensures that there IS a LEVEL set, even if we don't rely on it!
        self.log.setLevel(logging.NOTSET + 1)
        boxLogGF = tob.log.getGlobalFilter()
        boxLogGF.setLevel('NOTICE')
        self.log.addFilter(boxLogGF)

        # This is the handler to output messages to stdout on the host
        # If daemonized, stdout will be re-routed to syslog.
        # Optionally messages will be sent to a directory (if advised to do so via command line)
        boxLogHandler = logging.StreamHandler(sys.stdout)

        if os.getenv('PYCHARM_RUNNING_TOB', None) == '1':
            boxLogHandler.setFormatter(tob.log.PyCharmFormatter())
        elif sys.stdout.isatty():
            boxLogHandler.setFormatter(tob.log.ConsoleFormatter())
        else:
            boxLogHandler.setFormatter(tob.log.LogFormatter())

        self.log.addHandler(boxLogHandler)

        # provisional only
        boxLogGF.setLevel('DEBUG')
        self.log.notice('Debug Mode activated from command line.')

        # TODO 20190814: Extend logging mechanism to full functionality

        #####
        # Say Hello to the World!

        self.log.notice(f'{stamp.__title__}: {stamp.__description__}')
        self.log.notice('Version {}'.format(stamped_version))
        self.log.notice('Running on a {} host.'.format(self.system.system))
        if self.system.user is not None:
            self.log.notice("Running with permissions of user '{}'.".format(self.system.user))
        if self.system.venv is not None:
            self.log.notice('This seems to be a Python VirtualEnv.')
        if sys.executable:
            self.log.notice('Python version is {}.{}.{} ({}).'.format(sys.version_info.major,
                                                                      sys.version_info.minor,
                                                                      sys.version_info.micro,
                                                                      sys.executable))
        else:
            self.log.notice('Python version is {}.{}.{}.'.format(sys.version_info.major,
                                                                 sys.version_info.minor,
                                                                 sys.version_info.micro))

        if py36 is False:
            self.log.error("The Onion Box demands Python version 3.6 or higher to run. Please upgrade.")
            self.log.notice("If you're unable to upgrade your Python version, please use version 4.x of The Onion Box.")
            sys.exit()

        #####
        # Data persistance management
        # ... has to be setup here to prepare for self.nodes
        from tob.persistor import Storage
        self.storage = Storage(self.config.box.persistance_dir, self.system.user)

        #####
        # SOCKS Proxy definition
        from tob.proxy import Proxy
        from tob.config import ProxyConfig
        self.proxy = Proxy(ProxyConfig(self.config.proxy))

        #####
        # The Onionoo Interface
        from tob.onionoo import getOnionoo
        # This creates __OnionooManager__

        OnionooManager = getOnionoo()
        OnionooManager.proxy = self.proxy
        # clients will now call getOnionoo and get the configured OOManager

        #####
        # Management of Nodes
        from tob.nodes import Manager as NodesManager
        from tob.config import DefaultNodeConfig
        self.nodes = NodesManager(DefaultNodeConfig(self.config.tor), database=self.storage)

        # #####
        # # GeoIP2 interface
        self.geoip2 = None

        if self.config.box.geoip2_city is not None:
            try:
                import geoip2
            except ImportError:
                self.log.warning("Usage of a GeoIP2 City database demands availability of Python module 'geoip2'.")
            else:
                if os.path.exists(self.config.box.geoip2_city):
                    from tob.geoip import GeoIP2
                    self.geoip2 = GeoIP2(self.config.box.geoip2_city)
                    self.log.notice("Operating with GeoIP Database '{}'.".format(self.config.box.geoip2_city))

        if self.geoip2 is None:
            from tob.geoip import GeoIPOO
            self.geoip2 = GeoIPOO()

        #####
        # Our cron
        from tob.scheduler import Scheduler
        self.cron = Scheduler()

        # Check proper setting of Timezone
        # to compensate for a potential exception in the scheduler.
        # Thanks to Sergey (@senovr) for detecting this:
        # https://github.com/ralphwetzel/theonionbox/issues/19#issuecomment-263110953

        if self.cron.check_tz() is False:
            self.log.error("Unable to determine the name of the local timezone. "
                           "Please run 'tzinfo' to set it explicitely.")
            sys.exit(0)

        self.cron.start()

        #####
        # Time Management
        #
        from tob.deviation import getTimer

        self.time = getTimer(self.config.box.ntp_server or self.system.ntp)

        def update_time_deviation():

            if self.time.ntp is None:
                return

            ret_val = self.time.update_time_deviation()

            if ret_val is False:
                self.log.warning("Failed to communicate to NTP-Server '{}'!".format(self.time.ntp_server))
            else:
                self.log.notice("Server Time aligned against Time from '{}'; adjusted delta: {:+.2f} seconds."
                            .format(self.time.ntp, ret_val))

        update_time_deviation()
        self.cron.add_job(update_time_deviation, 'interval', id='ntp', hours=8)

        #####
        # The Onion Box Version Service
        from tob.version import VersionManager
        from datetime import datetime

        def check_version(checker, relaunch_job=False):
            from random import randint

            if checker is None:
                return

            next_run = None

            if checker.update() is True:
                self.log.info('Latest version of The Onion Box: {}'.format(checker.Box.latest_version()))

                if relaunch_job is True:
                    next_run = randint(30 * 60, 60 * 60)

            else:
                next_run = randint(15, 60)

            # TODO: This is a bit over-complicated; simplify?
            if next_run is not None:
                run_date = datetime.fromtimestamp(int(self.time()) + next_run)
                self.cron.add_job(check_version, 'date', id='updates',
                                 run_date=run_date, args=[checker, True])

        self.version = VersionManager(self.proxy, stamp.__stamp__ or stamp.__version__,
                                      self.system.system, self.system.release)
        check_version(self.version, True)


        #####
        # SESSION Management
        # from tob.session import SessionFactory, make_short_id
        from tob.session import SessionManager, make_short_id

        # This function is called when a session is deleted.
        # We use it to ensure that the nodes for this session are closed properly!
        def del_session_callback(session_id):
            #TODO 29100815: Necessary?
            return

            if session_id in boxNodes_old:
                for key, node in boxNodes_old[session_id].items():
                    node.shutdown()
                del boxNodes_old[session_id]
            return

        self.sessions = SessionManager(30, delete_session_callback=del_session_callback)

        #####
        # Recording of ...
        # ... the CPU Load, Memory Load & Temperature
        self.cron.add_job(self.system.record_performance_data, 'interval', seconds=1)

        #####
        # Almost done; lets compose the app...

        # Single node dashboard = default application
        from tob.apps import Dashboard
        theonionbox = Dashboard(sessions=self.sessions,
                                nodes=self.nodes,
                                proxy=self.proxy,
                                version=self.version,
                                config=self.config,
                                system=self.system,
                                geoip=self.geoip2
                                )

        # Controlcenter
        if self.config.cc is not None:

            from tob.apps import ControlCenter
            try:
                cc = ControlCenter(self.sessions,
                                   self.nodes,
                                   self.proxy,
                                   self.version,
                                   self.config)
            except Exception as exc:
                self.log.warning(f"Failed to launch ControlCenter: {exc}")
            else:
                theonionbox.merge(cc.routes)

                # Change default page
                theonionbox.default_page = 'cc.html'

        # Static files - which are many meanwhile
        from tob.static import SessionFileProvider
        from pathlib import Path
        boxLibsPath = 'libs'

        libs = SessionFileProvider(self.sessions, Path(boxLibsPath) / 'jquery-3.4.1' / 'jquery-3.4.1.min.js', '/jquery.js')

        libs.add(Path(boxLibsPath) / 'bootstrap-4.3.1' / 'js' / 'bootstrap.bundle.min.js', '/bootstrap.js')
        libs.add(Path(boxLibsPath) / 'bootstrap-4.3.1' / 'css' / 'bootstrap.min.css', '/bootstrap.css')

        libs.add(Path(boxLibsPath) / 'glide-3.4.1' / 'dist' / 'glide.js', '/glide.js')
        libs.add(Path(boxLibsPath) / 'glide-3.4.1' / 'dist' / 'css' / 'glide.core.css', '/glide.core.css')
        libs.add(Path(boxLibsPath) / 'glide-3.4.1' / 'dist' / 'css' / 'glide.theme.css', '/glide.theme.css')

        libs.add(Path(boxLibsPath) / 'scrollMonitor-1.2.4' / 'scrollMonitor.js', '/scrollMonitor.js')

        libs.add(Path(boxLibsPath) / 'smoothie-1.36' / 'smoothie.js', '/smoothie.js')

        # libs.add(Path(boxLibsPath) / 'underscore-1.9.1' / 'underscore-min.js', '/underscore.js')

        libs.add(Path(boxLibsPath) / 'js-md5-0.7.3' / 'md5.js', '/md5.js')

        libs.add(Path(boxLibsPath) / 'jquery.pep-0.6.10' / 'jquery.pep.js', '/pep.js')

        # libs.add(Path(boxLibsPath) / 'toggle-3.5.0' / 'js' / 'bootstrap4-toggle.min.js', '/toggle.js')
        # libs.add(Path(boxLibsPath) / 'toggle-3.5.0' / 'css' / 'bootstrap4-toggle.min.css', '/toggle.css')

        # This is not really a library ... but the scheme works here as well.
        libs.add(Path('scripts') / 'chart.js', 'chart.js')

        theonionbox.merge(libs)

        # Those are static files as well - yet created by a template run & stored into the session object

        from tob.static import TemplateFileProvider

        templt = TemplateFileProvider(self.sessions, 'box.js', '/box.js')
        templt.add('box.css', '/box.css')
        templt.add('cc.js', '/cc.js')
        templt.add('cc.css', '/cc.css')
        templt.add('auth.js', '/auth.js')

        theonionbox.merge(templt)

        # LatoLatin
        from tob.libraries import LatoLatin
        libLatoLatin = LatoLatin(self.sessions, os.path.join(boxLibsPath, 'LatoLatin'),
                                 valid_status=['ok', 'auto', 'error', 'login', 'frame'])
        theonionbox.merge(libLatoLatin)

        # Fontawesome
        from tob.libraries import FontAwesome
        libFontAwesome = FontAwesome(self.sessions, os.path.join(boxLibsPath, 'fontawesome-free-5.11.2-web'),
                                     valid_status='frame')
        theonionbox.merge(libFontAwesome)

        self.box = theonionbox.app

        #####
        # Our Web Server
        # This is a customization of the standard (v0.13) bottle.py CherootServer
        class CherootServer(bottle.ServerAdapter):
            def run(self, handler):  # pragma: no cover
                from cheroot import wsgi
                from cheroot.ssl import builtin
                self.options['bind_addr'] = (self.host, self.port)
                self.options['wsgi_app'] = handler
                certfile = self.options.pop('certfile', None)
                keyfile = self.options.pop('keyfile', None)
                chainfile = self.options.pop('chainfile', None)
                self.server = wsgi.Server(**self.options)
                if certfile and keyfile:
                    self.server.ssl_adapter = builtin.BuiltinSSLAdapter(
                        certfile, keyfile, chainfile)

                self.server.start()

            def shutdown(self):
                if self.server is not None:
                    self.server.stop()

        if self.config.box.ssl_key is not None:
            # SSL enabled
            self.server = CherootServer(host=self.config.box.host, port=self.config.box.port,
                                        certfile=self.config.box.ssl_certificate, keyfile=self.config.box.ssl_key)
            self.log.notice('Operating in SSL mode!')
        else:
            # Standard
            self.server = CherootServer(host=self.config.box.host, port=self.config.box.port)

    def shutdown(self):

        from tob.onionoo import getOnionoo

        self.log.propagate = False

        from threading import active_count, enumerate

        self.log.debug('ShutDown Initiated...')
        if self.geoip2 is not None:
            self.geoip2.close()

        self.log.debug('Shutting down webserver...')
        try:
            self.server.shutdown()
        except Exception as exc:
            self.log.warning("During ShutDown of WebServer: {}".format(exc))

        self.log.debug('Shutting down the connection to the proxy...')
        try:
            self.proxy.shutdown()
        except Exception as exc:
            self.log.warning("During ShutDown of the proxy connection: {}".format(exc))


        # boxFwrd.setTarget(None)
        # boxFwrd.close()

        self.nodes.shutdown()

        self.log.debug('Terminating cron jobs...')
        try:
            self.cron.shutdown()
        except Exception as exc:
            self.log.warning("During ShutDown of Cron: {}".format(exc))

        self.log.debug('Terminating Onionoo Management...')
        try:
            getOnionoo().shutdown()
        except Exception as exc:
            self.log.warning("During ShutDown of Onionoo: {}".format(exc))

        # List of running Threads
        lort = ''
        for th in enumerate():
            if len(lort) > 0:
                lort += ', '
            lort += th.name

        self.log.debug("List of threads still running (should only be 'MainThread'): {}".format(lort))

    def run(self):

        http_or_https = 'http' if self.config.box.ssl_key is None else 'https'
        self.log.notice('Ready to listen on {}://{}:{}/'.format(http_or_https, self.config.box.host, self.config.box.port))
        if sys.stdout.isatty():
            self.log.notice('Press Ctrl-C to quit!')

        try:
            self.server.run(self.box)
        except KeyboardInterrupt:
            # SIGINT consumed before ...
            # ... so this never emits!!
            self.log.notice("Received SIGINT signal.")
        except Exception as exc:
            self.log.error(exc)
        finally:
            self.shutdown()
            sys.exit(0)

        # print('Running...')