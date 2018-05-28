#!/usr/bin/env python
from __future__ import absolute_import
from __future__ import print_function

import site

#####
# Standard Imports
import itertools
import json
import os
import sys
import uuid
import signal
import logging

#####
# Python version detection
py = sys.version_info
py34 = py >= (3, 4, 0)
py30 = py >= (3, 0, 0)

#####
# Script directory detection
import inspect


def get_script_dir(follow_symlinks=True):
    if getattr(sys, 'frozen', False):  # py2exe, PyInstaller, cx_Freeze
        path = os.path.abspath(sys.executable)
    else:
        path = inspect.getabsfile(get_script_dir)
    if follow_symlinks:
        path = os.path.realpath(path)
    return os.path.dirname(path)


# to ensure that our directory structure works as expected!
os.chdir(get_script_dir())

#####
# Patching the import system to allow usage as module as well as stand alone
# https://www.python.org/dev/peps/pep-0366/
if __package__ is None:
    # sys.path.append(get_script_dir())
    # __package__ = 'theonionbox'
    pass

# print(get_script_dir())
# site.addsitedir(get_script_dir())

for (dirpath, dirnames, filenames) in os.walk(get_script_dir()):
    init_path = os.path.join(dirpath, '__init__.py')
    # print(dirpath)
    if os.path.isfile(init_path):
        # print("adding {}".format(dirpath))
        site.addsitedir(dirpath)

# print(sys.path)


#####
# Version & Stamping
from stamp import __description__, __version__, __stamp__
stamped_version = '{} (stamp {})'.format(__version__, __stamp__)


#####
# TOR manpage Index Information
from tob.manpage import ManPage
# from tob.manpage import ManPage

box_manpage = ManPage('tor/tor.1.ndx')


#####
# Command line interface
from getopt import getopt, GetoptError


def print_usage():
    print(__description__)
    print('Version v{}'.format(stamped_version))
    print("""
    Command line parameters:
     -c <path> | --config=<path>: Provide path & name of configuration file.
                                  Note: This is only necessary when NOT using
                                  './theonionbox.cfg' or './config/theonionbox.cfg'.
     -d | --debug: Switch on 'DEBUG' mode.
     -t | --trace: Switch on 'TRACE' mode (which is more verbose than DEBUG mode).
     -h | --help: Prints this information.
     -l <directory> | --log=<directory>: Define directory to additionally emit log
                                         messages to. Please assure correct access
                                         privileges!
    """)


box_cmdline = {'config': None,
               'debug': False,
               'trace': False,
               'log': None,
               'warn': []}

argv = sys.argv[1:]
opts = None

if argv:
    try:
        opts, args = getopt(argv, "c:dthl:m:", ["config=", "debug", "trace", "help", 'log=', 'mode='])
    except GetoptError as err:
        print(err)
        print_usage()
        sys.exit(0)
    for opt, arg in opts:
        if opt in ("-c", "--config"):
            box_cmdline['config'] = arg
        elif opt in ("-d", "--debug"):
            box_cmdline['debug'] = True
        elif opt in ("-t", "--trace"):
            box_cmdline['trace'] = True
        elif opt in ('-l', '--log'):
            box_cmdline['log'] = arg
        elif opt in ('-m', '--mode'):
            # '--mode' deprecated since 20180210
            box_cmdline['warn'].append("Command line parameter '-m' or '--mode' is no more necessary and "
                                       "thus DEPRECATED.")
        else:   # == ('-h','--help')
            print_usage()
            sys.exit(0)

#####
# Host System data
import platform

boxHost = {
    'system': platform.system(),
    'name': platform.node(),
    'release': platform.release(),
    'version': platform.version(),
    'machine': platform.machine(),
    'processor': platform.processor(),
    # Memory info will be ammended once we can ensure that the required modules are available.
    'venv': os.getenv('VIRTUAL_ENV', None)
}

# The user running this script
import getpass
try:
    boxHost['user'] = getpass.getuser()
except:
    pass

#####
# The Logging Infrastructure
# TODO: Check pre40!

# import logging
from logging.handlers import TimedRotatingFileHandler, MemoryHandler
from tob.log import addLoggingLevel, LoggingManager, ForwardHandler, getGlobalFilter

# logging.basicConfig()

# # Add Level to be inline with the Tor levels (DEBUG - INFO - NOTICE - WARN(ing) - ERROR)
# addLoggingLevel('NOTICE', logging.INFO + 5)
# # This one is to be inline with STEM's logging levels:
# addLoggingLevel('TRACE', logging.DEBUG - 5)

# valid level descriptors
boxLogLevels = ['TRACE', 'DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR']

# # This is the logger for Tor related messages.
# # The clients will get their messages from this logger.
# torLog = logging.getLogger('tor@theonionbox')
# torLog.setLevel('DEBUG')
# torLog.addHandler(logging.NullHandler())
#
# # this will manage all MessageHandlers to receive Tor's events
# # it will be instantiated later as soon as we've a contact to the Tor process
# torLogMgr = None

# This is the logger to handle the 'BOX' messages.
# All messages targeted for the host are handled here!
boxLog = logging.getLogger('theonionbox')

# We will Filter everything through the GlobalFilter
# NOTSET + 1 just ensures that there IS a LEVEL set, even if we don't rely on it!
boxLog.setLevel(logging.NOTSET + 1)
boxLogGF = getGlobalFilter()
boxLogGF.setLevel('NOTICE')
boxLog.addFilter(boxLogGF)

boxLog.addHandler(logging.NullHandler())

# This Handler collects all messages during the start of The Onion Box
# and then flushes it once the connection to the (local) tor is established.
# boxStartHandler = MemoryHandler(400)
# boxStartHandler.setLevel('NOTICE')
# boxLog.addHandler(boxStartHandler)

# This is the Handler to connect the boxLog with the torLog of the local Tor node
# as soon as we set it's target, all messages will be forwarded to this
# Remote Tors will get their own handler (that doesnt know of the start messages)
boxFwrd = ForwardHandler(level=logging.NOTICE, tag='box')
boxLog.addHandler(boxFwrd)

# This is the Handler to connect stem with boxLog
if box_cmdline['trace'] is True:
    from stem.util.log import get_logger as get_stem_logger,logging_level, Runlevel
    stemFwrd = ForwardHandler(level=logging_level(Runlevel.TRACE), tag='stem')
    stemLog = get_stem_logger()
    stemLog.addHandler(stemFwrd)
    stemFwrd.setTarget(boxLog)

# This is the handler to output messages to stdout on the host
# If daemonized, stdout will be re-routed to syslog.
# Optionally messages will be sent to a directory (if advised to do so via command line)
boxLogHandler = logging.StreamHandler(sys.stdout)

from tob.log import PyCharmFormatter, ConsoleFormatter, LogFormatter

if os.getenv('PYCHARM_RUNNING_TOB', None) == '1':
    boxLogHandler.setFormatter(PyCharmFormatter())
elif sys.stdout.isatty():
    boxLogHandler.setFormatter(ConsoleFormatter())
else:
    boxLogHandler.setFormatter(LogFormatter())

boxLog.addHandler(boxLogHandler)


# Optional LogFile handler; can be invoked (only) from command line
from tob.log import FileFormatter

if box_cmdline['log'] is not None:
    boxLogPath = box_cmdline['log']
    if os.access(boxLogPath, os.F_OK | os.W_OK | os.X_OK) is True:
        try:
            boxLogPath = os.path.join(boxLogPath, 'theonionbox.log')
            boxLogFileHandler = TimedRotatingFileHandler(boxLogPath, when='midnight', backupCount=5)
        except Exception as exc:
            box_cmdline['warn'].append('Failed to create LogFile handler: {}'.format(exc))
        else:
            boxLogFileHandler.setFormatter(FileFormatter())
            boxLog.addHandler(boxLogFileHandler)
    else:
        box_cmdline['warn'].append("Failed to establish LogFile handler for directory '{}'.".format(box_cmdline['log']))



#####
# Say HELLO to the world... !

# A few words regarding the notification system:
# The commandline parameters define the logging behaviour on the host system:
#   DEBUG only affects the Box. bottle and stem levels are set to 'NOTICE'.
#   TRACE forwards bottle debug and stem 'TRACE' info to the Box.
# Configuration file parameter message_level sets the threshold which level is forwarded to the clients!

boxLog.notice(__description__)
boxLog.notice('Version v{}'.format(stamped_version))
boxLog.notice('Running on a {} host.'.format(boxHost['system']))
if 'user' in boxHost:
    boxLog.notice("Running with permissions of user '{}'.".format(boxHost['user']))
if sys.executable:
    boxLog.notice('Python version is {}.{}.{} ({}).'.format(sys.version_info.major,
                                                      sys.version_info.minor,
                                                      sys.version_info.micro,
                                                      sys.executable))
else:
    boxLog.notice('Python version is {}.{}.{}.'.format(sys.version_info.major,
                                                      sys.version_info.minor,
                                                      sys.version_info.micro))
if boxHost['venv'] is not None:
    boxLog.notice('This seems to be a Python VirtualEnv.')

if box_cmdline['trace'] is True:
    boxLogGF.setLevel('TRACE')
    boxLog.notice('Trace Mode activated from command line.')
elif box_cmdline['debug'] is True:
    boxLogGF.setLevel('DEBUG')
    boxLog.notice('Debug Mode activated from command line.')

for warning in box_cmdline['warn']:
    boxLog.warning(warning)

#####
# Default Configuration

# The config file object
box_cfg_data = None

# Supported protocol
box_supported_protocol = [2]      # 20170416 RDW: We no longer support version 1.
box_protocol = None

# Standard configuration for a local Tor Relay
tor_control = 'port'
tor_host = '127.0.0.1'
tor_port = 'default'  # 9051 & 9151
tor_socket = '/var/run/tor/control'
# tor_proxy = None

tor_timeout = 10  # seconds
tor_ttl = 30  # seconds
tor_ERR = True
tor_WARN = True
tor_NOTICE = True

# Standard configuration of a 'The Onion Box' server
box_host = '127.0.0.1'
box_port = 8080
box_session_ttl = 300

box_ntp_server = None
box_message_level = 'NOTICE'
box_basepath = ''

box_ssl = False
box_ssl_certificate = None
box_ssl_key = None

box_geoip_db = None
box_proxy = 'default'  # 9050 & 9151

from tempfile import gettempdir
box_persistance_dir = gettempdir()

proxy_config = {
    'control': 'default',   # tor_config['control']
    'host': 'default',      # tor_config['host']
    'port': 'default',      # 9051 & 9151
    'socket': 'default',    # tor_config['socket']
    'proxy': 'default'      # 9050 & 9150
}

box_cc = {}


#####
# Configuration file management
from tob.ini import INIParser, DuplicateSectionError

# def getboolean(self, key, default=None):
#     try:
#         retval = self.as_bool(key)
#     except (ValueError, KeyError) as e:
#         retval = default
#     return retval
#
# Section.getboolean = getboolean

# Read the config file(s)
config_found = False

# Location and name of config files
box_config_path = 'config'
box_config_file = 'theonionbox.cfg'

if boxHost['venv'] is not None:
    config_files = [os.path.join(boxHost['venv'], box_config_path, box_config_file)]
else:
    config_files = []

config_files.extend([
    box_config_file,
    os.path.join(box_config_path, box_config_file)
])

if box_cmdline['config'] is not None:
    config_files = [box_cmdline['config']] + config_files

for config_file in config_files:
    if os.path.exists(config_file):
        try:
            box_cfg_data = INIParser(config_file)
            boxLog.notice("Operating with configuration from '{}'".format(os.path.abspath(config_file)))
            break
        except DuplicateSectionError as exc:
            boxLog.warning("While parsing '{}': {}".format(config_file, exc))
    else:
        boxLog.debug("No configuration file found at '{}'".format(os.path.abspath(config_file)))

if box_cfg_data is None:
    boxLog.notice('No (valid) configuration file found; operating with default settings.')
else:

    if 'config' in box_cfg_data.keys():
        box_protocol = box_cfg_data('config').getint('protocol', box_protocol)

    if box_protocol in box_supported_protocol:

        for section in box_cfg_data.sections():

            if section.key() == 'TheOnionBox':
                box_host = section.get('host', box_host)
                box_port = section.getint('port', box_port)
                box_session_ttl = section.getint('session_ttl', box_session_ttl)

                box_ntp_server = section.get('ntp_server', box_ntp_server)
                box_message_level = section.get('message_level', box_message_level).upper()
                box_basepath = section.get('base_path', box_basepath)

                box_ssl_certificate = section.get('ssl_certificate', box_ssl_certificate)
                box_ssl_key = section.get('ssl_key', box_ssl_key)
                box_ssl = box_ssl_certificate is not None and box_ssl_key is not None

                box_geoip_db = section.get('geoip2_city', box_geoip_db)

                box_persistance_dir = section.get('persistance_dir', box_persistance_dir)

                # Nothing currently deprecated in v2
                box_config_deprecated = [
                ]

                for option in box_config_deprecated:
                    try:
                        test = section.get(option)
                    except:
                        pass
                    else:
                        boxLog.warning("Configuration: Parameter '{}' is deprecated and will be ignored.".format(option))

            elif section.key() == 'Tor':
                tor_control = section.get('control', tor_control)
                tor_host = section.get('host', tor_host)
                tor_port = section.get('port', tor_port)
                tor_socket = section.get('socket', tor_socket)
                tor_timeout = section.getint('timeout', tor_timeout)
                tor_ttl = section.getint('ttl', tor_ttl)
                # tor_proxy = tor_config.get('proxy', tor_proxy)
                tor_ERR = section.getboolean('tor_preserve_ERR', tor_ERR)
                tor_WARN = section.getboolean('tor_preserve_WARN', tor_WARN)
                tor_NOTICE = section.getboolean('tor_preserve_NOTICE', tor_NOTICE)

            elif section.key() == 'TorProxy':
                proxy_config['control'] = section.get('control', proxy_config['control'])
                proxy_config['host'] = section.get('host', proxy_config['host'])
                proxy_config['port'] = section.get('port', proxy_config['port'])
                proxy_config['socket'] = section.get('socket', proxy_config['socket'])
                proxy_config['proxy'] = section.get('proxy', proxy_config['proxy'])

                if proxy_config['control'] not in ['port', 'socket']:
                    proxy_config['control'] = 'port'

            else:
                cc_key = section.key()
                node = {}
                node['name'] = cc_key
                node['control'] = section.get('control', None)
                node['host'] = section.get('host', None)
                node['port'] = section.get('port', None)
                node['socket'] = section.get('socket', None)
                node['cookie'] = section.get('cookie', None)
                node['nick'] = section.get('nick', None)
                if node['nick'] is None:
                    if cc_key[0] == '#':
                        node['nick'] = cc_key.split(':')[0]
                node['fp'] = section.get('fp', None)
                if node['fp'] is None:
                    if len(cc_key) == 41 and cc_key[0] == '$':
                        node['fp'] = cc_key
    
                if cc_key in box_cc:
                    boxLog.warning("Configuration: Parameters to control host '{}' defined several times. "
                                   "Initial definition preserved.".format(cc_key))
                elif node['control'] in ['port', 'socket', 'proxy']:
                    box_cc[uuid.uuid4().hex] = node

    else:
        boxLog.warning("Configuration file shows protocol version not supported: {}. Please verify "
                       "your settings and use version {} protocol."
                    .format(box_protocol, box_supported_protocol))


#####
# These are the modules necessary for basic operation.
# The dict will be extended while checking the configuration data to ensure
# we have everything to run according configuration.

pip_version = 'pip3' if py30 else 'pip'

# module name: {
#   module: name overwriting module name
#   version: required version definition
#   info: custom message to user
# }

required_modules = {

    # module name: {
    #   'module': name overwriting module name
    #   'version': required version definition
    #   'info': custom message to user if module not found
    # }

    'psutil': {
        'version': '>=5.4.0',
        'info': "Check 'https://pypi.python.org/pypi/psutil' for installation instructions."
    },
    'stem': {
        'version': '>=1.5.4'
    },
    'bottle': {
        'version': '>=0.12.13'
    },
    'apscheduler2': {
        'module': 'apscheduler',
        'version': '>=2.1.2, <3.*; python_version<"3.0"'
    },
    'apscheduler3': {
        'module': 'apscheduler',
        'version': '>=3.4; python_version>="3.0"'
    },
    'requests': {
        'version': '>=2.18.0'
    },
    'tzlocal': {
        'version': '>=1.5'
    },
    'pysocks': {
        'version': '>=1.6.7'
    },
    'futures': {
        'version': '>=3.2; python_version<"3.0"'
    },
    'urllib3': {
        'version': '>=1.22'
    }
}


#####
# Configuration data verification

if tor_timeout < 0:
    tor_timeout = None

if box_message_level not in boxLogLevels:
    boxLog.warning("Configuration: Wrong value '{}' defined for parameter 'message_level'.".format(box_message_level))
    boxLog.notice("Configuration: Operating now with default 'message_level' of 'NOTICE'.")
    box_message_level = 'NOTICE'

if box_session_ttl > 3600:
    box_session_ttl = 3600
if box_session_ttl < 30:
    box_session_ttl = 30

# Assure that the base_path has the following format:
# '/' (leading slash) + whatever + !'/' (NO trailing slash)
if len(box_basepath):
    if box_basepath[0] != '/':
        box_basepath = '/' + box_basepath
    if box_basepath[-1] == '/':
        box_basepath = box_basepath[:-1]

    boxLog.notice("Virtual base path set to '{}'.".format(box_basepath))

# tor_control validation
if tor_control not in ['port', 'socket', 'proxy']:
    boxLog.warning("Configuration: Wrong value '{}' defined for parameter 'tor_control'.".format(tor_control))
    boxLog.notice("Configuration: 'tor_control' set to default value 'port'.")
    tor_control = 'port'

# if tor_control is 'proxy':
#     boxLog.info("Proxy for Tor operations: {}:{}".format(proxy_config['host'], proxy_config['port']))
#     required_modules['pysocks'] = "To operate via the Tor SOCKS proxy you have to install python module '{0}': " \
#                                   "'pip install {0}'"

if box_ssl is True:
    required_modules['ssl'] = {
        'version': '>=1.16',
        'info': "To operate via SSL you have to install python module '\{0\}': '{} install \{0\}".format(pip_version)
    }

if proxy_config['control'] == 'default':
    proxy_config['control'] = tor_control
if proxy_config['host'] == 'default':
    proxy_config['host'] = tor_host
if proxy_config['socket'] == 'default':
    proxy_config['socket'] = tor_socket


# The following parameters will be verified later:
#   box_geoip_db


#####
# stem availability check
from pkgutil import find_loader

if find_loader('stem') is None or box_cmdline['debug'] is True or box_cmdline['trace'] is True:

    # Well! If module 'stem' is not available, we are not able to continue.
    # We yet try to connect to the relay to at least give the user an indication if his setup is ok.

    out = boxLog.notice

    if box_cmdline['debug'] is True or box_cmdline['trace'] is True:
        boxLog.debug('SimpleController Test in Debug & Trace mode:')
        out = boxLog.debug

    simple_tor = None

    if tor_control == 'port':

        from tob.simplecontroller import SimplePort
        out('Trying to connect to Tor @ {}:{}.'.format(tor_host, tor_port))

        if tor_port == 'default':
            try:
                simple_tor = SimplePort(tor_host, 9051)
                tor_port = 9051
            except Exception as exc:
                try:
                    simple_tor = SimplePort(tor_host, 9151)
                    tor_port = 9151
                except:
                    out('Failed to connect to Tor.')
        else:
            try:
                simple_tor = SimplePort(tor_host, tor_port)
            except:
                out('Failed to connect to Tor.')

    elif tor_control == 'socket':
        out("Trying to connect to Tor via socket @ '{}'.".format(tor_socket))

        try:
            from tob.simplecontroller import SimpleSocket
            simple_tor = SimpleSocket(tor_socket)
        except:
            out('Failed to connect to Tor.')

    if simple_tor is not None:
        out('Successfully connected to Tor @ {}:{}!'.format(tor_host, tor_port))
        out('This is the response to PROTOCOLINFO request:')
        try:
            pinfo_msg = simple_tor.msg('PROTOCOLINFO 1')
        except Exception as exc:
            boxLog.debug(exc)
        else:
            pinfo = pinfo_msg.splitlines()
            for line in pinfo:
                out(line)

        simple_tor.shutdown()

#####
# Module availability check & required versions verification (incl. stem for the second time!)
from pkg_resources import require, VersionConflict, DistributionNotFound

boxLog.debug('Required packages availability check & version verification:')
module_missing = False

for key in required_modules:

    module = required_modules[key]
    distribution_name = key if 'module' not in module else module['module']

    test_module = '{} {}'.format(distribution_name, module['version'])

    try:
        found = require(test_module)
        if len(found) > 0:  # if == 0 & no Exception, the module is not required for this version of Python
            boxLog.debug('> {} {} required; {} found @ {}.'.format(found[0].key,
                                                                   module['version'],
                                                                   found[0].parsed_version,
                                                                   found[0].location
                                                                   ))
    except VersionConflict as vc:
        module_missing = True

        boxLog.warning(
            "Required python module '{}' is outdated (version '{}' found). Please run '{} install --upgrade {}'."
            .format(vc.req, vc.dist, pip_version, distribution_name))

    except DistributionNotFound as dnf:
        module_missing = True

        if 'info' in module:
            boxLog.warning(module['info'].format(distribution_name))
        else:
            boxLog.warning("Required python module '{}' is missing. You have to install it via '{} install {}'."
                           .format(dnf.req, pip_version, distribution_name))

    except Exception as exc:
        module_missing = True
        boxLog.warning(exc)

if module_missing:
    boxLog.warning("Hint: You need to have root privileges to operate '{}'.".format(pip_version))
    sys.exit(0)


#####
# SOCKS Proxy definition
from tob.proxy import Proxy
boxProxy = Proxy(proxy_config)


#####
# stem preparation
# This is the Handler to connect stem with boxLog
from stem.util.log import get_logger as get_stem_logger, logging_level, Runlevel

stemLog = get_stem_logger()
stemLog.setLevel(logging_level(Runlevel.TRACE))  # we log TRACE...

if box_cmdline['trace'] is True:  # ... yet forward depending on the commandline parameter!
    stemFwrd = ForwardHandler(level=logging_level(Runlevel.DEBUG), tag='stem')
else:
    # Perhaps this should be 'WARN'?
    stemFwrd = ForwardHandler(level=logging_level(Runlevel.NOTICE), tag='stem')

stemFwrd.setTarget(boxLog)
stemLog.addHandler(stemFwrd)

#####
# GeoIP2 interface
tor_geoip = None

if box_geoip_db is not None:
    if find_loader('geoip2') is None:
        boxLog.warning("To use a GeoIP database, you have to install python module 'geoip2': '{} install geoip2'".format(pip_version))
        box_geoip_db = None
    else:
        if os.path.exists(box_geoip_db):
            from tob.geoip import GeoIP2

            tor_geoip = GeoIP2(box_geoip_db)
            boxLog.notice("Operating with GeoIP Database '{}'.".format(box_geoip_db))
        else:
            box_geoip_db = None

if box_geoip_db is None:
    from tob.geoip import GeoIPOO

    tor_geoip = GeoIPOO()

#####
# Amendment to Host System data
from psutil import virtual_memory

boxHost.update({
    'memory': virtual_memory().total,
    'memory|MB': int(virtual_memory().total / (1024 ** 2))
})

#####
# Check proper setting of Timezone
# to compensate for a potential exception in the scheduler.
# Thanks to Sergey (senovr) for detecting this:
# https://github.com/ralphwetzel/theonionbox/issues/19#issuecomment-263110953

from tob.scheduler import Scheduler

# Used to run all async activities within TOB
# The Nodes operate with their own Scheduler() object!
box_cron = Scheduler()
if box_cron.check_tz() is False:
    boxLog.error("Unable to determine the name of the local timezone. Please run 'tzinfo' to set it explicitely.")
    sys.exit(0)

#####
# Set DEBUG mode and Message Level
#
# box_debug is used to
#   * enable the debug mode of bottle

# box_debug = box_cmdline['debug']
#
# if box_cmdline['debug'] is True:
#     box_debug = True
#     boxLog.setLevel('DEBUG')
#     box_handler.setLevel('DEBUG')
#
#     # from stem.util.log import get_logger as get_stem_logger, Runlevel
#     #
#     # log_to_stdout(Runlevel.DEBUG)
#
#
# else:
#     box_debug = False
#     boxLog.info("Switching to Message Level '{}'.".format(box_message_level))
#     boxLog.setLevel('DEBUG')
#     box_handler.setLevel(box_message_level)

box_debug = False

#####
# Time Management
#
from tob.deviation import getTimer

box_time = getTimer()
box_time.setNTP(box_ntp_server)


def update_time_deviation():
    if box_ntp_server is None:
        return False

    ret_val = getTimer().update_time_deviation()

    if ret_val is False:
        boxLog.warning('Failed to communicate to NTP-Server \'{}\'!'.format(box_ntp_server))
    else:
        boxLog.info('Server Time aligned against Time from \'{}\'; adjusted delta: {:+.2f} seconds'
                    .format(box_ntp_server, ret_val))

    return ret_val


#####
# Temperature Sensor Detection
#
# @ the Windows users: Sorry folks! Windows needs admin rights to access the temp sensor.
# As long as this is the case Temperature display will not be supported on Windows!!

boxHost['temp'] = False
if boxHost['system'] == 'Linux':
    boxHost['temp'] = os.path.exists('/sys/class/thermal/thermal_zone0/temp')

elif boxHost['system'] == 'FreeBSD':
    from subprocess import check_output

    try:
        temp = check_output('sysctl -a | grep hw.acpi.thermal.tz0.temperature', shell=True).decode('utf-8').split()
    except:
        pass
    else:
        boxHost['temp'] = (temp[0] == 'hw.acpi.thermal.tz0.temperature:')

elif boxHost['system'] == 'Darwin':

    try:
        from tob.osxtemp import Temperature, Sensors, Units
        boxHost['temp_Darwin'] = Temperature(Sensors.CPU_0_PROXIMITY, Units.CELSIUS)
    except OSError:
        boxLog.warning('macOSX SMC access library not found. Please check README for further instructions.')
    else:
        try:
            boxHost['temp'] = (boxHost['temp_Darwin']() != 0)
        except OSError as exc:
            boxLog.warning(exc)

if boxHost['temp']:
    boxLog.notice('Temperature sensor information availabe. Expect to get a chart!')
else:
    boxLog.notice('No temperature sensor information found.')

#####
# Uptime Detection
#
# http://planzero.org/blog/2012/01/26/system_uptime_in_python,_a_better_way
# currently only supported runnig on Linux!

from datetime import datetime, timedelta

boxHost['up'] = None
if boxHost['system'] == 'Linux':
    try:
        with open('/proc/uptime', 'r') as f:
            up_sec = float(f.readline().split()[0])
        boxHost['up'] = datetime.fromtimestamp(box_time.time() - up_sec).strftime('%Y-%m-%d %H:%M:%S')

    except:
        pass

elif boxHost['system'] == 'Windows':

    # Due to the situation that there is no 'reliable' way to retrieve the uptime
    # on Windows, we rely on a third party tool:
    # uptime version 1.1.0: http://uptimeexe.codeplex.com/
    # Using v1.1.0 is critical/mandatory as the output changed from prior versions!
    # We expect to find this uptime.exe in ./uptime!

    import subprocess
    # from datetime import timedelta

    uptimes = []
    try:
        upt_v = subprocess.check_output('uptime/uptime.exe -v').decode('utf-8').strip()
    except:
        boxLog.notice("Failed to run 'uptime' tool (http://uptimeexe.codeplex.com). "
                      "Check documentation for further instructions!")
    else:
        # expected output format is exactly 'version 1.1.0'
        if upt_v == 'version 1.1.0':
            try:
                uptimes = subprocess.check_output('uptime/uptime.exe').decode('utf-8').split()

                # expected output format is now e.g. '22:23:43 uptime 02:16:21'
                if len(uptimes) == 3 and uptimes[1] == 'uptime':
                    upt = uptimes[2].split(':')
                    if len(upt) == 3:
                        its_now = datetime.fromtimestamp(box_time.time())
                        upt_diff = timedelta(hours=int(upt[0]),
                                             minutes=int(upt[1]),
                                             seconds=int(upt[2]),
                                             microseconds=its_now.microsecond)
                        boxHost['up'] = its_now - upt_diff
            except:
                pass
        else:
            boxLog.notice("Found 'uptime' tool yet version is not v1.1.0. "
                          "Check documentation for further instructions!")

elif boxHost['system'] == 'FreeBSD':

    import subprocess
    # from datetime import datetime

    try:
        uptimes = subprocess.check_output('/usr/bin/who -b', shell=True).decode('utf-8').split()
    except:
        pass
    else:
        # expected output format is now e.g. 'system boot   MMM dd hh:mm'
        if len(uptimes) == 5 and uptimes[0] == 'system' and uptimes[1] == 'boot':

            try:
                # Currently there is no YEAR data in the returned string!
                # Therefore this could crash around January 20xy!!
                upt = datetime.strptime(' '.join(uptimes[2:]), '%b %d %H:%M')
            except Exception as exc:
                boxLog.warning('Uptime information parsing error: {}'.format(exc))
            else:
                if upt.year == 1900:
                    its_now = datetime.fromtimestamp(box_time.time())
                    upt = upt.replace(year=its_now.year)

                boxHost['up'] = upt

elif boxHost['system'] == 'Darwin':

    import subprocess
    import re
    # from datetime import datetime

    try:
        uptime = subprocess.check_output('uptime', shell=True)

        # uptime return format is ... complex!

        # 17:35  up  5:10, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  14 mins, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  1 min, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  7 days, 5:10, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  7 days, 14 mins, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  7 days, 1 min, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  17 days, 5:10, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  17 days, 14 mins, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  17 days, 1 min, 1 user, load averages: 4.03 2.47 1.97
        # 17:35  up  1 day, 5:10, 1 user, load averages: 4.03 2.47 1.97

        uptime = re.findall('(\d+:\d+)(?:  up  )(?:(\d+)(?: days?, ))?(?:(\d+:\d+)|(?:(\d+)(?: mins?))),', uptime)

        # we just expect one match!
        if len(uptime) == 1:
            uptime = uptime[0]

    except:
        pass
    else:
        # Uptime RegEx tuple: (Timestamp, Days, hours:mins, mins)
        # hours:mins and mins are mutually exclusive!
        if len(uptime) == 4:
            (ts, days, hours, mins) = uptime

            if hours != '':
                hours = hours.split(':')
                mins = hours[1]
                hours = hours[0]

            days = days or '0'
            hours = ('00{}'.format(hours))[-2:]
            mins = ('00{}'.format(mins))[-2:]

            try:
                its_now = datetime.fromtimestamp(box_time.time())
                upt_diff = timedelta(days=int(days),
                                     hours=int(hours),
                                     minutes=int(mins))
                upt = its_now - upt_diff

            except Exception as exc:
                boxLog.warning('Uptime information parsing error: {}'.format(exc))
            else:
                boxHost['up'] = upt.strftime('%Y-%m-%d %H:%M')

if boxHost['up']:
    boxLog.notice('Uptime information located. Expect to get a readout!')
else:
    boxLog.notice('No uptime information available.')


#####
# The Onion Box Version Service
from tob.version import VersionManager


def check_box_version(use_this_checker, relaunch_job=False):
    from random import randint

    if use_this_checker is None:
        return

    next_run = None

    if use_this_checker.update() is True:
        boxLog.info('Latest version of The Onion Box: {}'.format(use_this_checker.Box.latest_version()))

        if relaunch_job is True:
            next_run = randint(30 * 60, 60 * 60)

    else:
        next_run = randint(15, 60)

    if next_run is not None:
        run_date = datetime.fromtimestamp(int(box_time()) + next_run)
        box_cron.add_job(check_box_version, 'date', id='updates',
                         run_date=run_date, args=[use_this_checker, True])


boxVersion = VersionManager(boxProxy, __stamp__ or __version__, boxHost['system'], boxHost['release'])
check_box_version(boxVersion, True)

#####
# Data persistance management
from tob.persistor import Storage

boxStorage = Storage(box_persistance_dir, boxHost['user'] if 'user' in boxHost else None)

#####
# READY to GO!

#####
# Run the Scheduler
box_cron.start()

#####
# The nodes we manage...
boxNodes = {}

# boxNodes is a dict of the following structure:
# boxNode = { session_id : { node_index: node } }


# This function is called when a session is deleted.
# We use it to ensure that the nodes for this session are closed properly!
def del_session_callback(session_id):
    if session_id in boxNodes:
        for key, node in boxNodes[session_id].items():
            node.close()

        del boxNodes[session_id]


#####
# SESSION Management
from tob.session import SessionFactory, make_short_id

# standard session management
box_sessions = SessionFactory(box_time, box_session_ttl, del_session_callback)

#####
# Live Data Management
from collections import deque
from threading import RLock
# from tob.livedata import LiveDataManager
import time

#####
# Management of ...
# ... the CPU Load, Memory Load & Temperature
host_cpudata = deque(maxlen=300)
host_cpudata_lock = RLock()


def record_cpu_data(timestamp=None, compensate_deviation=True):
    from psutil import virtual_memory, cpu_percent, cpu_count  # to readout the cpu load

    if timestamp is None:
        timestamp = time.time()

    if compensate_deviation is True:
        timestamp = box_time(timestamp)

    timestamp *= 1000  # has to be converted to ms as JS expects ms!

    # we always catch the current cpu load
    cpu = {}
    count = 0

    # first: overall cpu load:
    cpu['c'] = cpu_percent(None, False)

    # 20180527 RDW: Isn't this wrong (at least on Windows 10)?
    # to indicate values according to the logic of the Windows Task Manager
    # if boxHost['system'] == 'Windows':
    #    cpu['c'] /= cpu_count()

    # notice: psutil.cpu_percent() will return a meaningless 0.0 when called for the first time
    # this is not nice yet doesn't hurt!
    for cx in cpu_percent(None, True):
        cpu['c%s' % count] = cx
        count += 1

    cpu['s'] = timestamp

    # ... and the percentage of memory usage
    cpu['mp'] = virtual_memory().percent

    if boxHost['temp']:
        if boxHost['system'] == 'Linux':
            try:
                cpu['t'] = float(open('/sys/class/thermal/thermal_zone0/temp').read()) / 1000.0
            except:
                pass
        elif boxHost['system'] == 'FreeBSD':
            # This is EXTREMELY slow!
            # => Disabled!!

            # from subprocess import check_output
            # try:
            #     temp = check_output('sysctl -a | grep hw.acpi.thermal.tz0.temperature', shell=True)\
            #         .decode('utf-8').split()
            # except:
            #     pass
            # else:
            #     if len(temp) == 2:
            #         try:
            #             cpu['t'] =  int(temp[1].strip().rstrip('C'))
            #         except:
            #             pass

            pass

        elif boxHost['system'] == 'Darwin':
            try:
                cpu['t'] = boxHost['temp_Darwin']()
            except:
                pass

    # append the data to the list
    host_cpudata_lock.acquire()
    host_cpudata.append(cpu)
    host_cpudata_lock.release()


box_cron.add_job(record_cpu_data, 'interval', seconds=1)


#####
# ONIONOO Protocol Interface

from tob.onionoo import OnionOOFactory, Details, Bandwidth, Weights, Mode

onionoo = OnionOOFactory(boxProxy)


def refresh_onionoo(relaunch_job=False, delayed=5):
    from random import randint

    # fp = tor.get_fingerprint() if tor else None

    # if fp is not None:
    #   onionoo.add(fp)

    if delayed < 0:
        delayed = 0

    box_cron.add_job(onionoo.refresh, 'date', id='onionoo_job', run_date=datetime.now() + timedelta(seconds=delayed))

    for key, node in box_cc.items():
        if node['fp'] is None and node['nick'] is not None:
            fp = onionoo.nickname2fingerprint(node['nick'])
            if fp is not None:
                # print(fp)
                if fp[0] != '$':
                    fp = '$' + fp
                node['fp'] = fp

    if box_cron.get_job('onionoo') is not None:
        return

    # schedule the next run...
    if relaunch_job:
        next_run = int(box_time()) + randint(3600 * 4, 3600 * 12)
        run_date = datetime.fromtimestamp(next_run)
        boxLog.info('Next scheduled retry to refresh ONIONOO @ {}'.format(run_date.strftime('%Y-%m-%d %H:%M:%S')))
        box_cron.add_job(refresh_onionoo, 'date', id='onionoo', run_date=run_date, args=[True])

    return


refresh_onionoo(relaunch_job=True, delayed=5)


#####
# BOTTLE
from bottle import Bottle, run, debug
from bottle import redirect, template, static_file
from bottle import request, response
from bottle import HTTPError, HTTPResponse

# import bottle
from bottle import _stderr as bottle_stderr, _stdout as bottle_stdout
import bottle

# Our WebServer implementation
theonionbox = Bottle()
theonionbox_name = 'The Onion Box'

# set the bottle debug mode
if box_cmdline['trace'] is True:
    debug(True)


    # Log connection requests...
    @theonionbox.hook('before_request')
    def debug_request():
        boxLog.trace(request.environ['PATH_INFO'])

else:
    debug(False)

# to redirect the bottle() output to our logging framework
bottle_stderr = boxLog.debug
bottle_stdout = boxLog.trace


boxLibsPath = 'libs'

# jQuery version
jQuery = {
    'dir': 'jquery-3.3.1',
    'js': "jquery-3.3.1.min.js"
}

# Bootstrap
Bootstrap = {
    'dir': 'bootstrap-4.1.1',
    'js': 'bootstrap.bundle.min.js',
    'css': 'bootstrap.min.css'
}

# Glide.js
Glide = {
    'dir': os.path.join('glide-3.0.4', 'dist'),
    'js': 'glide.js',
    'core.css': 'glide.core.css',
    'theme.css': 'glide.theme.css'
}

# scrollMonitor
scrollMonitor = {
    'dir': 'scrollMonitor-1.2.4',
    'js': 'scrollMonitor.js',
}

#SmoothieChart
smoothie = {
    'dir': 'smoothie-1.34.0',
    'js': 'smoothie.js'
}


#####
# WebServer implementation starts here

# It would be by far better to use the Tor Standard icon! ;)

theonionbox_icon = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwQAADsEBu" \
                   "JFr7QAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC42/Ixj3wAAAXBJREFUOE+lk7tKA1EQhvcJfAKxFt9ErA" \
                   "TBRmxEbCQIgqKNjZCYygsbtJREjJpFURSNNtEUgRTGSqxDIGgKkxQpx/2GnLNHXJHgwr87Zy7/XM6sJyJe+PAaGP3" \
                   "Y8LAxZDGSHJPdlC+X61dSmAkUyOiwub59oohgYTshhdlAsuO5WGDDJ5YAg3G8Xb6TeqUuvc+eArm4UlRbbuJI5vcW" \
                   "vxNQmslc3a9Kt9mVx+STnE6fSRC2UE6XVfd8WFOf87kLGU6NRgT0ZzLjSCBnF/mpE7WZSna2/IiAIaGkVDIjXydu5" \
                   "P31QwExOmz4IBNjCZg0Svo12QnkC1pvLf3SDj7IxFgCDCgHIUC2BG4Lpc2SypRNILhfe1Ddry1k0geqZEDtRluOJ/" \
                   "N6doGu0+jYIRJjCdxr5KqYNpWYayQzwbXsi/rgq1tpCFiKJX/VZiMLpdIvQHYXCd8fm2hI/lplGxxHACiN/hgS5QN" \
                   "kdLE/0/9+Z/G+AJ9+UUM+BIFlAAAAAElFTkSuQmCC"

icon_marker = "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAA" \
              "DsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAC9SURBVDhPpZK9DcJADIVTUFBcmTXo" \
              "KTNAxqFIiRR6RonEAhQMQUmRMSiO90U2csSBAhSfdLbf8/25yjk/OWxOSXRiEKPBmlyK2mhqxE3kN1BrZkYSQXARragN1mdB" \
              "7S62k1ELjuc7HcXKuzrkRG+aq1iT5Py+04sporrvvCPg8gRtSRxBY9qBgJcjqEviCBrTjn8Zfz6qPw4XX/o4HUH8jr5kANX2" \
              "pkGbPBkHgK6fBmCantjx+5EL5oVDnqsHL/DYhRMxwWIAAAAASUVORK5CYII="

#####
# Page Construction
#
# '!' as first character creates a named div
# '-' as entry adds a <hr>

#####
# Template rendering based on type
# html_template = functools.partial(template, template_adapter=MakoTemplate)
# js_template = functools.partial(template, template_settings={'syntax': '/* */ // {{ }}'})


# box_sections_begin = ['!header', 'header', '!content']


# The sections of the index page
box_sections = ['!header', 'header',
                '!content', 'host', 'config', 'hiddenservice', 'local',
                'network', 'network_bandwidth', 'network_weights', '-',
                'accounting', 'monitor',
                # 'family',
                'control', 'messages',
                'license']

# The sections of the login page
login_sections = ['!header', 'header', '!content', 'login', 'license']

# The sections of the error page
error_sections = ['!header', 'header', '!content', 'error', 'license']


# Default Landing Page
@theonionbox.get('/')
def get_start():

    session = box_sessions.create(request.remote_addr, 'login')

    if session is None:
        raise HTTPError(404)

    return connect_session_to_node(session, 'theonionbox')


# When monitoring a controlled node, this is the default landing page
# in case of login error or logout procedure
@theonionbox.get('/<session_id>/')
def get_restart(session_id):

    session = box_sessions.recall(session_id, request.remote_addr)

    if session is None:
        return get_start()

    try:
        node_id = session['node'].id if 'node' in session else None
    except:
        node_id = None
        #
    # print('node_id: {}'.format(node_id))
    box_sessions.delete(session_id)

    if node_id is None:
        return get_start()

    if node_id in box_cc or node_id == 'theonionbox':
        login_session = box_sessions.create(request.remote_addr, 'login')
        return connect_session_to_node(login_session, node_id)

    return get_start()


# Used to open another node from the ControlCenter
@theonionbox.get('/<session_id>/open')
def get_open(session_id):

    session = box_sessions.recall(session_id, request.remote_addr)

    # this is better than asserting!
    if session is None:
        raise HTTPError(404)

    node_id = request.GET.get('node', None)
    search_id = request.GET.get('search', None)

    if node_id is not None:

        # in 'cc' we stored this session's index pointing to the controlled nodes dict
        index_to_host = session['cc']

        node_to_open = None
        for key, index in index_to_host.items():
            if index == node_id:
                node_to_open = key
                break

        if node_to_open in box_cc:
            login_session = box_sessions.create(request.remote_addr, 'login')
            return connect_session_to_node(login_session, node_to_open)
        else:
            raise HTTPError(404)

    elif search_id is not None:

        latest_search = session.get('latest_search')

        if search_id in latest_search:
            network_session = box_sessions.create(request.remote_addr, 'search')
            network_session['search'] = latest_search[search_id]
            redirect(box_basepath + '/{}/search.html'.format(network_session.id()))

    raise HTTPError(404)


def connect_session_to_node(session, node_id):
    from stem import SocketError
    from stem.connection import MissingPassword, IncorrectPassword
    from tob.nodes import TorNode
    from tob.controller import create_controller

    if session is None:
        raise HTTPError(404)

    session_id = session.id()

    node = None
    try:
        node = boxNodes[session_id][node_id]
    except KeyError:

        display_error = None
        node_data = {}

        # raise 404 if we don't know this node ID
        if node_id == 'theonionbox':
            node_data['control'] = tor_control
            node_data['socket'] = tor_socket
            node_data['host'] = tor_host
            node_data['port'] = tor_port

            # reuse existing!
            boxToNode = boxFwrd

        elif node_id in box_cc:
            node_data = box_cc[node_id]

            # new
            boxToNode = None
            # boxLog.addHandler(boxToNode)

        else:
            box_sessions.delete(session.id())
            raise HTTPError(404)

        # create controller based on defined mode:
        try:
            contrl = create_controller(node_data, boxProxy, tor_timeout)

        except Exception as err:
            display_error = err

        else:
            try:
                node = TorNode(controller=contrl, storage=boxStorage ,listener=boxToNode)
                node.id = node_id

                # connect the message handling system!
                # boxLog.addHandler(boxToNode)
                # boxToNode.setTarget(node.torLog)

                boxLog.info('Connected!')

            except Exception as err:
                display_error = err

        finally:
            if display_error is not None:
                # print(display_error)
                return create_error_page(session, display_error)

        if session_id not in boxNodes:
            boxNodes[session_id] = {}

        boxNodes[session_id][node_id] = node

    if node is None:
        box_sessions.delete(session.id())
        return HTTPError(404)

    try:
        pi = node.tor.get_protocolinfo()
    except:
        box_sessions.delete(session.id())
        return HTTPError(404)

    # Ok. So far it looks good. Let's store this for later use!
    # print(node_id, type(node_id))
    session['node'] = node

    try:
        node.authenticate(protocolinfo_response=pi)

    except (MissingPassword, IncorrectPassword):

        # Standard login Page delivery
        session['auth'] = 'digest' if node.password else 'basic'

        boxLog.info("{}@{} is knocking for Login; '{}' procedure provided."
                    .format(session.id_short(), session.remote_addr(), session['auth']))

        session['stylesheets'] = ['bootstrap.css', 'fonts.css', 'box.css']
        session['scripts'] = ['jquery.js', 'bootstrap.js', 'auth.js', 'box.js']

        section_config = {}
        section_config['header'] = {
            'logout': False,
            'title': 'The Onion Box',
            'subtitle': "Version: {}<br>Your address: {}".format(stamped_version, request.get('REMOTE_ADDR'))
        }
        section_config['login'] = {
            'timeout': box_session_ttl * 1000  # js!
        }

        params = {
            'session': session
            , 'tor': node.tor
            , 'session_id': session.id()
            , 'icon': theonionbox_icon
            , 'box_stamp': stamped_version
            , 'virtual_basepath': box_basepath
            , 'sections': login_sections
            , 'section_config': section_config
            , 'box.js_login': True  # flag to manipulate the creation process of 'box.js'
        }

        # import warnings
        # warnings.filterwarnings()

        # prepare the includes
        session['box.js'] = template('scripts/box.js', **params)
        session['box.css'] = template('css/box.css', **params)
        session['fonts.css'] = template('css/latolatinfonts.css', **params)

        if 'auth' in session:
            if session['auth'] == 'basic':
                session['auth.js'] = template('scripts/authrequest_basic.js'
                                              , virtual_basepath=box_basepath
                                              , session_id=session_id)
            else:  # e.g. if login['auth'] == 'digest'
                session['auth.js'] = template('scripts/authrequest_digest.js'
                                              , md5_js_file='scripts/md5.js'
                                              , virtual_basepath=box_basepath
                                              , session_id=session_id)

        # deliver the login page
        return template("pages/index.html", **params)

    except Exception as exc:
        #print(exc)
        return create_error_page(session, exc)

    # owning_pid = node.tor.get_conf('__OwningControllerProcess', None)
    # print(owning_pid)
    session['status'] = 'auto'  # this indicates that there is no login necessary; therefore no logout possible!
    redirect(box_basepath + '/{}/index.html'.format(session.id()))


def create_error_page(session, display_error=None):
    if display_error is None:
        display_error = BaseException

    # We failed to connect to Tor and have to admit this now!
    session['status'] = 'error'

    session['stylesheets'] = ['bootstrap.css', 'fonts.css', 'box.css']
    session['scripts'] = ['jquery.js', 'bootstrap.js', 'box.js']

    section_config = {}
    section_config['header'] = {
        'logout': False,
        'title': 'The Onion Box',
        'subtitle': "Version: {}<br>Your address: {}".format(stamped_version, request.get('REMOTE_ADDR'))
    }

    params = {
        'session': session
        , 'tor': None
        , 'session_id': session.id()
        , 'icon': theonionbox_icon
        , 'box_stamp': stamped_version
        , 'virtual_basepath': box_basepath
        , 'sections': error_sections
        , 'section_config': section_config
        , 'error_msg': display_error
        , 'box.js_login': True  # flag to manipulate the creation process of 'box.js'
    }

    # prepare the includes
    session['box.js'] = template('scripts/box.js', **params)
    session['box.css'] = template('css/box.css', **params)
    session['fonts.css'] = template('css/latolatinfonts.css', **params)

    # deliver the login page
    return template("pages/index.html", **params)


#####
#  The Authentication System

@theonionbox.get('/<login_id>/login.html')
def perform_login(login_id):
    from base64 import b64decode
    from hashlib import md5

    # from bottlepy
    def tob(s, enc='utf8'):
        return s.encode(enc) if isinstance(s, str) else bytes(s)

    def touni(s, enc='utf8', err='strict'):
        if isinstance(s, bytes):
            return s.decode(enc, err)
        else:
            return str(s or ("" if s is None else s))

    boxLog.debug("{}@{} requests '{}'".format(make_short_id(login_id), request.remote_addr, 'login.html'))
    boxLog.debug(
        "{}: addr = {} / route = {}".format(make_short_id(login_id), request.remote_addr, request.remote_route))

    login_session = box_sessions.recall(login_id, request.remote_route[0])

    if login_session is None:
        redirect(box_basepath + '/')
        return False  # necessary?

    if login_session['status'] != 'login':
        box_sessions.delete(login_session.id())
        redirect(box_basepath + '/')
        return False  # necessary?

    node = login_session['node']
    if node is None:
        box_sessions.delete(login_session.id())
        redirect(box_basepath + '/')

    try:
        raise_login = True
        realm = "user@TheOnionBox"
        auth_method = "TheOnionBox"

        header = request.environ.get('HTTP_AUTHORIZATION', '')
        if header != '':
            try:
                method, data = header.split(None, 1)
                if method == auth_method:

                    # Basic Authentication
                    if login_session['auth'] == 'basic':
                        user, pwd = touni(b64decode(tob(data))).split(':', 1)

                        if user == login_session.id():
                            raise_login = (node.authenticate_with_password(pwd) is False)

                    # Digest Authentication
                    elif login_session['auth'] == 'digest':

                        # the data comes as in as 'key1="xxx...", key2="xxx...", ..., key_x="..."'
                        # therefore we split @ ', '
                        # then remove the final '"' & split @ '="'
                        # to create a nice dict.
                        request_data = dict(item[:-1].split('="') for item in data.split(", "))

                        ha1_prep = (login_session.id() + ":" + realm + ":" + node.password).encode('utf-8')
                        ha1 = md5(ha1_prep).hexdigest()
                        ha2_prep = (request.method + ":" + request_data['uri']).encode('utf-8')
                        ha2 = md5(ha2_prep).hexdigest()
                        resp_prep = (ha1 + ":{}:".format(login_session['nonce']) + ha2).encode('utf-8')
                        response = md5(resp_prep).hexdigest()

                        if response == request_data['response']:
                            raise_login = (node.authenticate_with_password(node.password) is False)
            except:
                pass

        if raise_login:
            acc_denied = HTTPError(401, 'Access denied!')

            # Request Basic Authentication
            if login_session['auth'] == 'basic':
                acc_denied.add_header('WWW-Authenticate', '{} realm = {}'.format(auth_method, realm))

            # Request Digest Authentication
            else:
                login_session['nonce'] = uuid.uuid1().hex
                login_session['opaque'] = uuid.uuid4().hex
                header = '{} realm={}, nonce={}, opaque={}'
                header = header.format(auth_method, realm, login_session['nonce'], login_session['opaque'])
                acc_denied.add_header('WWW-Authenticate', header)

            raise acc_denied

    except HTTPError:
        raise

    # at this stage we have a successful login
    # and switch to standard session management
    active_session = box_sessions.create(login_session.remote_addr(), 'prepared')
    boxLog.info("{}@{} received session token '{}'; immediate response expected."
                .format(login_session.id_short(), login_session.remote_addr(), active_session.id_short()))

    active_session['node'] = login_session['node']
    active_session['prep_time'] = box_time()

    box_sessions.delete(login_session.id())

    return active_session.id()



# This is the standard page!
@theonionbox.get('/<session_id>/index.html')
def get_index(session_id):
    from stem import SocketError

    session = box_sessions.recall(session_id, request.remote_addr)

    # this is better than asserting!
    if session is None:
        redirect(box_basepath + '/')
        return False  # necessary?

    status = session.get('status', None)

    if status == 'prepared':

        # TODO: RDW 20160913 shouldn't this be session[prep_time] ?
        delay = box_time() - session.last_visit

        if delay > 2.0:  # seconds
            session['status'] = 'toolate'  # ;)
            boxLog.info('{}@{}: Login to Session delay expired. Session canceled.'
                        .format(session.id_short(), session.remote_addr()))
        else:
            session['status'] = 'ok'
            # we have a successfull connection! Celebrate this!
            boxLog.notice('{}@{}: Session established.'.format(session.id_short(), session.remote_addr()))

    if session['status'] not in ['ok', 'auto']:
        box_sessions.delete(session.id())
        redirect(box_basepath + '/')
        return False

    node = session['node']
    if node is None:
        box_sessions.delete(session.id())
        redirect(box_basepath + '/')
        return False

    # asyncronously refreshing the bandwidth data
    node.refresh_bw()

    tor = node.tor

    # try:
    #     ec = tor.get_info('bw-event-cache')
    #     ecl = ec.split(' ')
    # except:
    #     pass
    # boxLog.debug((len(ecl)))
    # boxLog.debug(print(ecl))

    # try:
    #     # We use this first request
    #     # a) to load the cache
    #     # b) to ensure that our connection is up...
    #
    #     # adapt this list as required to mass-request these data upfront
    #     # to prevent single requests later demanding exhaustive time
    #     getinfo_params = [
    #         'accounting/enabled'
    #         , 'config-file'
    #         , 'config/names'
    #         , 'fingerprint'
    #         , 'net/listeners/control'
    #         , 'net/listeners/dir'
    #         , 'net/listeners/or'
    #         , 'net/listeners/socks'
    #         , 'status/version/current'
    #         , 'version'
    #     ]
    #
    #     # tor.get_info(getinfo_params)
    #
    # except SocketError:
    #     boxLog.warning('SocketError while initiating index.html creation process.')
    #     # we lost the authentication. Therefore: Redirect!
    #     box_sessions.delete(session.id())
    #     redirect(box_basepath + '/')
    #     return False

    # try:
    #     ec = tor.get_info('bw-event-cache')
    #     ecl = ec.split(' ')
    # except:
    #     pass
    # boxLog.debug((len(ecl)))
    # boxLog.debug(print(ecl))

    # get the onionoo data
    fingerprint = tor.get_fingerprint()

    onionoo.add(fingerprint)

    # asyncronously refreshing the onionoo data
    refresh_onionoo()

    onionoo_details = onionoo.details(fingerprint)
    onionoo_bw = onionoo.bandwidth(fingerprint)
    onionoo_weights = onionoo.weights(fingerprint)

    # Test
    # __family_fp__ = '5CECC5C30ACC4B3DE462792323967087CC53D947'

    # for testing purposes of the family performance
    # onionoo.add(__family_fp__)
    # onionoo.refresh()

    #
    # family_details = onionoo.details(__family_fp__)
    # fams = ['effective_family', 'alleged_family', 'indirect_family']
    #
    # if family_details is not None:
    #     for fam in fams:
    #         fam_det = family_details(fam)
    #         if fam_det is not None:
    #             for fp in fam_det:
    #                 if fp[0] is '$':
    #                     onionoo.add(fp[1:])
    #
    # onionoo.refresh(True)


    # assure data completeness of control center info
    # for key, node in box_cc.items():
    #     if node['fp'] is None and node['nick'] is not None:
    #         nickname = node['nick']
    #         if nickname[0] == '#':
    #             nickname = nickname[1:]
    #         try:
    #             print(tor.get_server_descriptor(nickname))
    #         except:
    #             pass
    #
    #         # fp = onionoo.nickname2fingerprint(node['nick'])
    #         # if fp is not None:
    #         #     # print(fp)
    #         #     if fp[0] != '$':
    #         #         fp = '$' + fp
    #         #     node['fp'] = fp
    #
    import stem.descriptor.remote
    #
    # for desc in stem.descriptor.remote.get_server_descriptors():
    #    print(desc.nickname, desc.fingerprint)


    # reset the time flags!
    del session['cpu']
    del session['accounting']
    del session['monitor']
    del session['network']
    del session['network_bw']
    del session['network_weights']
    del session['family']

    # update_tor_info()

    # show onionoo data ONLY if already available!!
    # onionoo_show = onionoo_details.has_data() or onionoo_bw.has_data() or onionoo_weights.has_data()
    boxLog.debug('{},{},{}'.format(onionoo_details.has_data() , onionoo_bw.has_data() , onionoo_weights.has_data()))

    # setup the MessageHandler for this session
    node.torLogMgr.add_client(session_id)

    # prepare the preserved events for hardcoded transfer
    from tob.log import sanitize_for_html
    p_ev = node.torLogMgr.get_events(session_id, encode=sanitize_for_html)

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

    sections += ['controlcenter']

    if tor.is_localhost():
        sections += ['host']

    sections += ['config', 'hiddenservice', 'local']

    if onionoo_details.has_data():
        sections += ['network']

        if onionoo_bw.has_data():
            sections += ['network_bandwidth']

        if onionoo_weights.has_data():
            sections += ['network_weights']

        sections += ['-']  # <hr>

    if accounting_switch is True:
        sections += ['accounting']

    sections += ['monitor', 'transport']

    # this is for testing purposes only
    sections += ['nodes', 'transport']

    # if fingerprint:
    #     sections.append('family')


    sh = {}
    if len(box_cc) > 0:
        sections += ['control']

        # in 'cc' we store this session's index pointing to the controlled nodes dict
        # this index is recreated every time index.html is reloaded to prevent traceability of links
        for key in box_cc:
            sh[key] = uuid.uuid4().hex

    session['cc'] = sh

    sections += ['messages']

    sections += ['license']

    session['sections'] = sections
    # node.sections = sections

    session['stylesheets'] = ['bootstrap.css', 'fonts.css', 'glide.core.css', 'glide.theme.css']
    session['scripts'] = ['jquery.js', 'bootstrap.js', 'smoothie.js', 'chart.js', 'scrollMonitor.js', 'glide.js']

    #session['stylesheets'] = ['bootstrap.css', 'fonts.css']
    #session['scripts'] = ['jquery.js', 'bootstrap.js', 'smoothie.js', 'chart.js', 'scrollMonitor.js']
    #session['scripts'] = ['jquery.js', 'bootstrap.js', 'smoothie.js']

    # to ensure, that 'box.xxx' is the latest element...
    session['stylesheets'].append('box.css')
    session['scripts'].append('box.js')

    import socket

    if node.tor.is_localhost() is True:
        at_location = socket.gethostname()
    else:
        try:
            at_location = node.tor.get_info('address')
        except:
            at_location = 'Remote Location'

    section_config = {}
    section_config['header'] = {
        'logout': session['status'] != 'auto',
        'title': tor.get_nickname(),
        'subtitle': "Tor {} @ {}<br>{}".format(tor.get_version_short(), at_location, fingerprint),
        'powered': "monitored by <b>The Onion Box</b> v{}".format(stamped_version)
    }

    if boxVersion is not None:
        if boxVersion.Box.is_latest_tag(__version__) is False:
            update_title = 'Update available!'
            update_content = """
                <div class='container-fluid' style='width: 250px'>
                    <div class='row'>
                        <div class='col-xs-7'>Your version:</div>
                        <div class='col-xs-5'>{}</div>
                    </div>
                    <div class='row'>
                        <div class='col-xs-7'>Latest version:</div>
                        <div class='col-xs-5'>{}</div>
                    </div>
                    <div class='row'>
                        <p class='config_group' color='lightgrey'></p>
                    </div>""".format(__version__, boxVersion.Box.latest_version())
            update_msg = boxVersion.Box.message
            if update_msg and len(update_msg) > 0:
                update_content += """
                    <div class='row'>
                        <div class='col-xs-12'>
                            {}
                        </div>
                    </div>
                    <div class='row'>
                        <p class='config_group' color='lightgrey'></p>
                    </div>""".format(update_msg)
            update_content += """
                    <div class='row'>
                        <div class='col-xs-12 text-center'>
                            <a href='https://github.com/ralphwetzel/theonionbox/releases/latest' target='_blank'>
                                Check release notes on GitHub!
                            </a>
                        </div>
                    </div>
                </div>"""

            section_config['header']['achtung'] = {'title': update_title, 'content': update_content}

    def get_lines(info):
        info_lines = info.split('\n')
        return len(info_lines)

    transport = {
        'or': get_lines(node.tor.get_info('orconn-status')),
        'stream': get_lines(node.tor.get_info('stream-status')),
        'circ': get_lines(node.tor.get_info('circuit-status')),
    }

    # print(node.tor.get_info('orconn-status'))


    params = {
        'session': session
        , 'read_bytes': node.bwdata['download']
        , 'written_bytes': node.bwdata['upload']
        , 'tor': tor
        , 'host': boxHost
        , 'session_id': session_id
        , 'preserved_events': p_ev
        , 'server_time': box_time()
        , 'accounting_on': accounting_switch
        , 'accounting_stats': accounting_stats
        , 'icon': theonionbox_icon
        , 'marker': icon_marker
        , 'box_stamp': stamped_version
        , 'box_debug': box_debug
        , 'boxVersion': boxVersion
        , 'virtual_basepath': box_basepath
        , 'sections': sections
        , 'manpage': box_manpage
        # , 'oo_show': onionoo_show
        , 'oo_details': onionoo_details
        , 'oo_bw': onionoo_bw
        , 'oo_weights': onionoo_weights
        , 'section_config': section_config
        , 'oo_factory': onionoo
        , 'geoip': tor_geoip
        , 'family_fp': fingerprint
        , 'controlled_nodes': box_cc
        , 'transport_status': transport

    }

    # Test
    #    from bottle import SimpleTemplate
    #    tpl = SimpleTemplate(name='scripts/box.js')
    #    tpl.prepare(syntax='/* */ // {{ }}')
    #    bjs = tpl.render(**params)

    # prepare the includes
    session['box.js'] = template('scripts/box.js', **params)
    session['box.css'] = template('css/box.css', **params)
    session['fonts.css'] = template('css/latolatinfonts.css', **params)

    # deliver the main page
    return template("pages/index.html", **params)


@theonionbox.get('/<session_id>/logout.html')
def get_logout(session_id):
    session = box_sessions.recall_unsafe(session_id)

    if session is not None:
        boxLog.notice('{}@{}: Active LogOut!'.format(session.id_short(), session.remote_addr()))
        # box_sessions.delete(session_id)
        redirect(box_basepath + '/' + session_id + '/')
    else:
        boxLog.warning(
            'LogOut requested from unknown client: {}@{}'.format(make_short_id(session_id), request.remote_addr))

    redirect(box_basepath + '/')


@theonionbox.get('/<session_id>/manpage.html')
def get_manpage(session_id):
    session = box_sessions.recall(session_id, request.remote_addr)
    if session is None or session['status'] not in ['ok', 'auto']:
        raise HTTPError(404)
    return static_file('tor.1.html', root='tor', mimetype='text/html')


# font provisioning
@theonionbox.get('/<session_id>/fonts/<filename:re:.*\.eot>')
@theonionbox.get('/<session_id>/fonts/<filename:re:.*\.ttf>')
@theonionbox.get('/<session_id>/fonts/<filename:re:.*\.woff>')
@theonionbox.get('/<session_id>/fonts/<filename:re:.*\.woff2>')
def get_font(session_id, filename):
    session = box_sessions.recall(session_id, request.remote_addr)
    if session is None:
        raise HTTPError(404)

    status = session['status']
    if status not in ['login', 'ok', 'error', 'auto', 'search']:
        raise HTTPError(404)

    mime_type = {
        '.eot': 'application/vnd.ms-fontobject',
        '.ttf': 'application/font-sfnt',
        '.woff': 'application/font-woff',
        '.woff2': 'application/font/woff2'
    }

    fname, fxtension = os.path.splitext(filename)

    if fxtension not in mime_type:
        raise HTTPError(404)

    # really very naive way to select the right path ...
    filepath = 'LatoLatin/fonts/'
    if fname == 'tob':
        filepath = 'tob/'

    return static_file(filepath + filename, root='font', mimetype=mime_type[fxtension])

@theonionbox.post('/<session_id>/search')
def post_search(session_id):
    
    session = box_sessions.recall(session_id, request.remote_addr)

    # this is better than asserting!
    if session is None:
        raise HTTPError(404)

    if session['status'] not in ['ok', 'auto']:
        raise HTTPError(503)

    data = request.forms.get('for', None)
    if data is None:
        return HTTPError(404)

    if onionoo is not None:
        result = onionoo.search(data)

        found = []
        search = {}

        if result is not None:

            if 'relays' in result:
                for relay in result['relays']:
                    fn = {}
                    try:
                        fn['n'] = relay['n']
                        # fn['f'] = relay['f']
                        fn['r'] = relay['r']
                        fn['t'] = 'r'
                        fn['i'] = uuid.uuid4().hex
                        found.append(fn)
                    except:
                        pass
                    else:
                        search[fn['i']] = relay['f']

            if 'bridges' in result:
                for bridge in result['bridges']:
                    fn = {}
                    try:
                        fn['n'] = bridge['n']
                        # fn['f'] = bridge['h']
                        fn['r'] = bridge['r']
                        fn['t'] = 'b'
                        fn['i'] = uuid.uuid4().hex
                        found.append(fn)
                    except:
                        pass
                    else:
                        search[fn['i']] = bridge['h']

        session['latest_search'] = search

        return json.JSONEncoder().encode(found)

    return HTTPError(404)

@theonionbox.get('/<session_id>/search.html')
def get_search(session_id):

    session = box_sessions.recall(session_id, request.remote_addr)

    if session is None:
        raise HTTPError(404)

    if session['status'] not in ['search']:
        raise HTTPError(503)

    search_id = session.get('search')

    if search_id is None:
        raise HTTPError(404)

    onionoo.add(search_id)
    onionoo.refresh(True, False)

    onionoo_details = onionoo.details(search_id)
    onionoo_bw = onionoo.bandwidth(search_id)
    onionoo_weights = onionoo.weights(search_id)

    # reset the time flags!
    del session['network']
    del session['network_bw']
    del session['network_weights']
    del session['family']

    # show onionoo data ONLY if already available!!
    # onionoo_show = onionoo_details.has_data() or onionoo_bw.has_data() or onionoo_weights.has_data()

    sections = ['!header', 'header',
                '!content']

    if onionoo_details.has_data():
        sections += ['network']

        if onionoo_bw.has_data():
            sections += ['network_bandwidth']

        if onionoo_weights.has_data():
            sections += ['network_weights']

        sections += ['-']  # <hr>

    else:
        nodata = session.get('nodata', 0) + 1
        if nodata < 3:
            session['nodata'] = nodata
            redirect_url = box_basepath + '/' + session_id + '/search.html?search={}'.format(search_id)
            # print(redirect_url)
            redirect(redirect_url)
        else:
            del session['search']
            exc = Exception('The Tor network status protocol did not provide data for this node.')
            return create_error_page(session_id, exc)

    # sections += ['messages']
    sections += ['license']

    session['sections'] = sections

    session['stylesheets'] = ['bootstrap.css', 'fonts.css', 'box.css']
    session['scripts'] = ['jquery.js', 'bootstrap.js', 'smoothie.js', 'chart.js', 'box.js', 'scrollMonitor.js']

    section_config = {}
    section_config['header'] = {
        'logout': False,
        'title': onionoo_details('nickname') or 'Unnamed',
        'subtitle': "{}<br>{}".format(onionoo_details('platform') or 'Tor', search_id),
        'powered': "Tor network status protocol data presented by <b>The Onion Box</b> v{}".format(stamped_version)
    }

    params = {
        'session': session
        , 'tor': None
        , 'session_id': session_id
        , 'server_time': box_time()
        , 'icon': theonionbox_icon
        , 'marker': icon_marker
        , 'box_stamp': stamped_version
        , 'box_debug': box_debug
        , 'virtual_basepath': box_basepath
        , 'sections': sections
        , 'manpage': box_manpage
        # , 'oo_show': onionoo_show
        , 'oo_details': onionoo_details
        , 'oo_bw': onionoo_bw
        , 'oo_weights': onionoo_weights
        , 'section_config': section_config
        , 'oo_factory': onionoo
        , 'geoip': tor_geoip
        , 'family_fp': search_id
    }

    # Test
    #    from bottle import SimpleTemplate
    #    tpl = SimpleTemplate(name='scripts/box.js')
    #    tpl.prepare(syntax='/* */ // {{ }}')
    #    bjs = tpl.render(**params)

    # prepare the includes
    session['box.js'] = template('scripts/box.js', **params)
    session['box.css'] = template('css/box.css', **params)
    session['fonts.css'] = template('css/latolatinfonts.css', **params)

    # deliver the main page
    return template("pages/index.html", **params)


@theonionbox.post('/<session_id>/data.html')
def post_data(session_id):
    # tor.get_getinfo_keys()

    session = box_sessions.recall(session_id, request.remote_addr)

    # this is better than asserting!
    if session is None:
        raise HTTPError(404)

    node = None
    tor = None

    if session['status'] in ['ok', 'auto']:
        node = session['node']
        if node is None:
            raise HTTPError(404)
        tor = node.tor
        fp = tor.get_fingerprint()
    elif session['status'] in ['search']:
        fp = session['search']
    else:
        raise HTTPError(503)

    its_now = int(box_time()) * 1000  # JS!

    return_data_dict = {'tick': its_now}

    box_sections = session['sections']

    # host
    if 'host' in box_sections:

        if ('cpu' not in session) or (session['cpu'] == 0):
            host_cpudata_lock.acquire()
            # cpu_list = list(itertools.islice(host_cpudata, None))
            cpu_list = list(host_cpudata)
            host_cpudata_lock.release()
        else:
            limit_timestamp = session['cpu']
            host_cpudata_lock.acquire()
            # cpu_list = list(itertools.takewhile(lambda x: x['s'] >= limit_timestamp, host_cpudata))
            cpu_list = list(itertools.dropwhile(lambda x: x['s'] < limit_timestamp, host_cpudata))
            host_cpudata_lock.release()

        # this little hack ensures, that we deliver data on the
        # first *two* calls after launch!
        session['cpu'] = its_now if 'cpu' in session else 0

        if len(cpu_list) > 0:
            return_data_dict['gen'] = cpu_list

    # accounting
    if 'accounting' in box_sections:

        tts = tor.get_timestamp()
        if ('accounting' not in session) or (session['accounting'] < tts):

            acc = {'enabled': False}

            if tor.get_isAccountingEnabled():
                acc['enabled'] = True
                acc['stats'] = tor.get_accountingStats()

            # this little hack ensures, that we deliver data on the
            # first *two* calls after launch!
            # session['accounting'] = tts if 'accounting' in session else 0
            session['accounting'] = tts

            return_data_dict['acc'] = acc

    # messages
    if 'messages' in box_sections:
        runlevel = request.forms.get('runlevel', None)

        if runlevel:

            rl_dict = json.JSONDecoder().decode(runlevel)

            # boxLog.debug('Levels from the client @ {}: {}'.format(session_id, rl_dict))

            for key in rl_dict:
                node.torLogMgr.switch(session_id, key, rl_dict[key])

        from tob.log import sanitize_for_html
        log_list = node.torLogMgr.get_events(session_id, encode=sanitize_for_html)

        if len(log_list) > 0:
            return_data_dict['msg'] = log_list

    # get the onionoo data
    onionoo_details = onionoo.details(fp)
    onionoo_bw = onionoo.bandwidth(fp)
    onionoo_weights = onionoo.weights(fp)

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
                retval = node.livedata.get_data(interval=interval, since_timestamp=last_ts)
                if len(retval) > 0:
                    return_data_dict['mon'][interval] = retval
            except Exception as e:
                print(e)
                pass

        if ('network_bw' not in session) or (session['network_bw'] == 0):
            res = {}
            obwr = onionoo_bw.read()
            obww = onionoo_bw.write()
            if obwr is not None:
                res['read'] = obwr
            if obww is not None:
                res['write'] = obww
            if len(res) > 0:
                return_data_dict['mon']['oo_bw'] = res

        # this little hack ensures, that we deliver data on the
        # first *two* calls after launch!
        session['monitor'] = its_now if 'monitor' in session else 0

    # operations monitoring
    if 'controlcenter' in box_sections:

        return_data_dict['cc'] = {}
        last_ts = None
        if 'controlcenter' in session:
            last_ts = session['controlcenter']
            if last_ts == 0:
                last_ts = None

        # try:
        #     retval = node.livedata.get_data(since_timestamp=last_ts)
        #     if len(retval) > 0:
        #         return_data_dict['cc']['1s'] = retval
        # except Exception as e:
        #     print(e)
        #     pass

        retval = node.livedata.get_data(since_timestamp=last_ts)
        if len(retval) > 0:
            return_data_dict['cc']['1s'] = retval

        # this little hack ensures, that we deliver data on the
        # first *two* calls after launch!
        session['controlcenter'] = its_now if 'cc' in session else 0

    if 'network' in box_sections:
        # Once there was code here.
        # It's no more ;) !
        pass

    if 'network_bandwidth' in box_sections:
        if ('network_bw' not in session) or (session['network_bw'] == 0):
            return_data_dict['oo_bw'] = {'read': onionoo_bw.read(), 'write': onionoo_bw.write()}
            # this little hack ensures, that we deliver data on the
            # first *two* calls after launch!
            session['network_bw'] = onionoo_bw.published() if 'network_bw' in session else 0
        elif session['network_bw'] != onionoo_bw.published():
            del session['network_bw']
            # if there's new data act as if we've not had any before!
            # we'll therefore deliver the new data with the next run!

    if 'network_weights' in box_sections:
        if ('network_weights' not in session) or (session['network_weights'] == 0):

            details = {'cw': onionoo_details('consensus_weight'),
                       'cwf': onionoo_details('consensus_weight_fraction'),
                       'gp': onionoo_details('guard_probability'),
                       'mp': onionoo_details('middle_probability'),
                       'ep': onionoo_details('exit_probability')}

            return_data_dict['oo_weights'] = {'cw': onionoo_weights.consensus_weight(),
                                              'cwf': onionoo_weights.consensus_weight_fraction(),
                                              'ep': onionoo_weights.exit_probability(),
                                              'gp': onionoo_weights.guard_probability(),
                                              'mp': onionoo_weights.middle_probability(),
                                              'data': details
                                              }

            # print(return_data_dict['oo_weights'])

            # this little hack ensures, that we deliver data on the
            # first *two* calls after launch!
            session['network_weights'] = onionoo_weights.published() if 'network_weights' in session else 0
        elif session['network_weights'] != onionoo_weights.published():
            del session['network_weights']
            # if there's new data act as if we've not had any before!
            # we'll therefore deliver the new data with the next run!

    if 'family' in box_sections:

        # get the family entries from the onionoo details of the node
        fp = tor.get_fingerprint()
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

    # Now json everything... and return it!
    return json.JSONEncoder().encode(return_data_dict)


#####
# Standard file processing!

@theonionbox.get('/<session_id>/<filename:re:.*\.css>')
def send_css(session_id, filename):
    session = box_sessions.recall(session_id, request.remote_addr)
    if session is None:
        raise HTTPError(404)

    # css_files = []
    # status = session['status']

    if filename in session['stylesheets']:
        if filename in session:
            file = session[filename]
            # 3.0.4
            session[filename] = None
            if file is None:
                # This happens when the file is requested more than once!
                raise HTTPError(404)
            else:
                headers = {'Content-Type': 'text/css; charset=UTF-8'}
                return HTTPResponse(file, **headers)

        elif filename == 'bootstrap.css':
            # print(bootstrapCSS, bootstrapDir+'/css')
            return static_file(Bootstrap['css'], root=os.path.join(boxLibsPath, Bootstrap['dir'], 'css'), mimetype='text/css')
        elif filename in ['glide.core.css', 'glide.theme.css']:
            return static_file(Glide[filename[6:]], root=os.path.join(boxLibsPath, Glide['dir'], 'css'), mimetype='text/css')
        else:
            return static_file(filename, root='css', mimetype='text/css')

    raise HTTPError(404)


@theonionbox.get('/<session_id>/<filename:re:.*\.js>')
def send_js(session_id, filename):
    session = box_sessions.recall(session_id, request.remote_addr)
    if session is None:
        raise HTTPError(404)

    # js_files = []
    # status = session['status']

    if filename in session['scripts']:
        if filename in session:
            file = session[filename]
            # 3.0.4
            session[filename] = None
            if file is None:
                # This happens when the file is requested more than once!
                raise HTTPError(404)
            else:
                headers = {'Content-Type': 'application/javascript; charset=UTF-8'}
                return HTTPResponse(file, **headers)

        elif filename == 'bootstrap.js':
            return static_file(Bootstrap['js'],
                               root=os.path.join(boxLibsPath, Bootstrap['dir'], 'js'), mimetype='text/javascript')
        elif filename == 'jquery.js':
            return static_file(jQuery['js'], root=os.path.join(boxLibsPath, jQuery['dir']), mimetype='text/javascript')
        elif filename == 'glide.js':
            return static_file(Glide['js'], root=os.path.join(boxLibsPath, Glide['dir']), mimetype='text/javascript')
        elif filename == 'smoothie.js':
            return static_file(smoothie['js'],
                               root=os.path.join(boxLibsPath, smoothie['dir']), mimetype='text/javascript')
        elif filename == 'scrollMonitor.js':
            return static_file(scrollMonitor['js'],
                               root=os.path.join(boxLibsPath, scrollMonitor['dir']), mimetype='text/javascript')
        else:
            return static_file(filename, root='scripts', mimetype='text/javascript')

    raise HTTPError(404)


# def handle_livedata(event):
#
#     if event is None:
#         return False
#
#     # record the data of the CPU
#     record_cpu_data()
#
#     # now manage the bandwidth data
#     tor_livedata.record_bandwidth(time_stamp=event.arrived_at
#                                   , bytes_read=event.read
#                                   , bytes_written=event.written)
#
#     return True

# def record_cpu_data(timestamp=None, compensate_deviation=True):
#     from psutil import virtual_memory, cpu_percent, cpu_count  # to readout the cpu load
#
#     if timestamp is None:
#         timestamp = time()
#
#     if compensate_deviation is True:
#         timestamp = box_time(timestamp)
#
#     timestamp *= 1000  # has to be converted to ms as JS expects ms!
#
#     # we always catch the current cpu load
#     cpu = {}
#     count = 0
#
#     # first: overall cpu load:
#     cpu['c'] = cpu_percent(None, False)
#
#     # to indicate values according to the logic of the Windows Task Manager
#     if boxHost['system'] == 'Windows':
#         cpu['c'] /= cpu_count()
#
#     # notice: psutil.cpu_percent() will return a meaningless 0.0 when called for the first time
#     # this is not nice yet doesn't hurt!
#     for cx in cpu_percent(None, True):
#         cpu['c%s' % count] = cx
#         count += 1
#
#     cpu['s'] = timestamp
#
#     # ... and the percentage of memory usage
#     cpu['mp'] = virtual_memory().percent
#
#     if boxHost['temp']:
#         if boxHost['system'] == 'Linux':
#             try:
#                 cpu['t'] = float(open('/sys/class/thermal/thermal_zone0/temp').read()) / 1000.0
#             except:
#                 pass
#         elif boxHost['system'] == 'FreeBSD':
#             # This is EXTREMELY slow!
#             # => Disabled!!
#
#             # from subprocess import check_output
#             # try:
#             #     temp = check_output('sysctl -a | grep hw.acpi.thermal.tz0.temperature', shell=True)\
#             #         .decode('utf-8').split()
#             # except:
#             #     pass
#             # else:
#             #     if len(temp) == 2:
#             #         try:
#             #             cpu['t'] =  int(temp[1].strip().rstrip('C'))
#             #         except:
#             #             pass
#
#             pass
#         elif boxHost['system'] == 'Darwin':
#             #try:
#             cpu['t'] = boxHost['temp_Darwin']()
#             print(boxHost['temp_Darwin']())
#             #except:
# #                pass
#
#     # append the data to the list
#     host_cpudata_lock.acquire()
#     host_cpudata.append(cpu)
#     host_cpudata_lock.release()


# This is our new (v3) default server
# https://fgallaire.github.io/wsgiserver/
class HTTPServer(bottle.ServerAdapter):
    def run(self, handler):
        from tob.server import Server
        self.server = Server(handler, self.host, self.port, **self.options)
        self.server.start()

    def shutdown(self):
        if self.server is not None:
            self.server.stop()


# This job runs at midnight to add a notification to the log
# showing the current day
def job_NewDayNotification():
    timestamp = box_time()
    boxLog.notice("----- Today is {}. -----".format(datetime.fromtimestamp(timestamp).strftime('%A, %Y-%m-%d')))
    return


box_cron.add_job(job_NewDayNotification, 'cron', id='ndn', hour='0', minute='0', second='0')

# NTP time is used to compensate for server clock adjustments
box_cron.add_job(update_time_deviation, 'interval', hours=8)

housekeeping_interval = 5  # seconds
bw_countdown = 100


def session_housekeeping():
    # We perform HERE things that have to happen regularly

    # TODO: remove sessions with status 'error'

    # 2.2: check for expired session
    if box_sessions is not None:

        while True:
            expired_session_id = box_sessions.check_for_expired_session(remove_expired_session=False)

            if expired_session_id is None:
                break

            session = box_sessions.recall_unsafe(expired_session_id)
            if session is not None:
                boxLog.notice('{}@{}: Session expired.'.format(session.id_short(), session.remote_addr()))

            node = session['node']
            # un-subscribe this session_id from the event handling
            if node is not None:
                node.torLogMgr.remove_client(expired_session_id)

            box_sessions.delete(expired_session_id)

            # # un-subscribe this session_id from the event handling
            # if torLogMgr:
            #     torLogMgr.remove_client(expired_session_id)

    # global tor_password

    # 4: closing connection to tor
    # if this is requested
    # for key, node in boxNodes.items():
    #     tor = node.tor
    #     if tor and tor.is_authenticated() and tor_ttl > 0:  # <==0 => don't ever close the connection!
    #
    #         current_time = int(box_time())
    #         lv = box_sessions.latest_visit()
    #         if lv is not None:  # indicates that there's been no connection at all!
    #             if current_time - lv > tor_ttl:
    #                 msg = 'No more client activity for {} seconds. Trying to close the connection to TOR: ' \
    #                     .format(int(current_time - lv))
    #                 try:
    #                     tor.close()
    #                 except:
    #                     pass
    #
    #                 if tor.is_alive():
    #                     msg += 'Failed!'
    #                 else:
    #                     msg += 'Done!'
    #                     node.password = None
    #                     box_sessions.reset()
    #                     msg += ' All sessions expired!'
    #
    #                     # ensure that the charts look nice when we reconnect
    #                     # see _handle_livedata for further details!
    #                     record_cpu_data(timestamp=current_time)
    #                     node.livedata.record_bandwidth(time_stamp=current_time)
    #
    #                 boxLog.notice(msg)


box_cron.add_job(session_housekeeping, 'interval', seconds=housekeeping_interval)


update_time_deviation()

#####
# Our Web Server
tob_server = None

if box_ssl is True:
    # SSL enabled
    tob_server = HTTPServer(host=box_host, port=box_port, certfile=box_ssl_certificate, keyfile=box_ssl_key)
    # boxLog.notice("Operating with WSGIserver in SSL mode!")
    boxLog.notice('Operating in SSL mode!')
else:
    # Standard
    # tob_server_options = {'handler_class': box_FixedDebugHandler}
    tob_server = HTTPServer(host=box_host, port=box_port)
    # boxLog.notice('Operating with WSGIserver!')


def exit_procedure():

    log = logging.getLogger('theonionbox')
    log.propagate = False

    try:
        # Python 3.x
        from threading import active_count
    except ImportError:
        # Python 2.x
        from threading import activeCount
        active_count = activeCount

    from threading import enumerate

    log.debug('ShutDown Initiated...')
    if tor_geoip is not None:
        tor_geoip.close()

    log.debug('Shutting down webserver...')
    try:
        tob_server.shutdown()
    except Exception as exc:
        log.warning("During ShutDown of WebServer: {}".format(exc))

    log.debug('Shutting down the connection to the proxy...')
    try:
        boxProxy.shutdown()
    except Exception as exc:
        log.warning("During ShutDown of the proxy connection: {}".format(exc))

    boxFwrd.setTarget(None)
    boxFwrd.close()

    for session, nodes in boxNodes.items():
        if nodes is not None:
            for key, node in nodes.items():
                if node is not None:
                    log.debug("Shutting down controller to '{}'...".format(key))
                    node.shutdown()
        nodes = {}

    log.debug('Terminating cron jobs...')
    try:
        box_cron.shutdown()
    except Exception as exc:
        log.warning("During ShutDown of Cron: {}".format(exc))

    log.debug('Terminating onionoo management...')
    try:
        onionoo.shutdown()
    except Exception as exc:
        log.warning("During ShutDown of onionoo: {}".format(exc))

    # List of running Threads
    lort = ''
    for th in enumerate():
        if len(lort) > 0:
            lort += ', '
        lort += th.name

    log.debug("List of threads still running (should only be 'MainThread'): {}".format(lort))


#####
# Procedure to answer SIGTERM

def sigterm_handler(_signo, _stack_frame):
    log = logging.getLogger('theonionbox')
    log.warning("Received SIGTERM signal.")
    # this will trigger the shutdown process in main()
    if tob_server is not None:
        # log.warning("... via Server")
        tob_server.shutdown()
        sys.exit(0)
    else:
        # log.warning("... via exit")
        exit_procedure()
        sys.exit(0)


signal.signal(signal.SIGTERM, sigterm_handler)



def main(run_debug=False, open_browser=True):

    # print(__package__)

    log = logging.getLogger('theonionbox')

    # if we're here ... almost everything is setup and running
    # good time to launch the housekeeping for the first time!
    session_housekeeping()

    http_or_https = 'http' if box_ssl is False else 'https'
    log.notice('Ready to listen on {}://{}:{}/'.format(http_or_https, tob_server.host, tob_server.port))
    if sys.stdout.isatty():
        log.notice('Press Ctrl-C to quit!')

    try:
        if run_debug is True:
            run(theonionbox, server=tob_server, host=box_host, port=box_port)
        else:
            run(theonionbox, server=tob_server, host=box_host, port=box_port, quiet=True)
    except KeyboardInterrupt:
        # SIGINT consumed before ...
        # ... so this never emits!!
        log.notice("Received SIGINT signal.")
    except Exception as exc:
        raise exc
    finally:
        exit_procedure()
        sys.exit(0)


if __name__ == '__main__':



    # try:
    #     tor = connect2tor()
    # except:
    #     boxLog.notice('Trying again later...')

    # Now we can establish the Handlers for Tor's messages
    # ... even if we failed to connect to Tor!
    # torLogMgr = LoggingManager(tor, notice=tor_NOTICE, warn=tor_WARN, err=tor_ERR)
    # and enable the Forwarder
    # boxFwrd.setTarget(torLog)

    # update_time_deviation()
    #
    # tob_server = None
    #
    # if box_ssl is True:
    #     # SSL enabled
    #     tob_server = HTTPServer(host=box_host, port=box_port, certfile=box_ssl_certificate, keyfile=box_ssl_key)
    #     # boxLog.notice("Operating with WSGIserver in SSL mode!")
    #     boxLog.notice('Operating in SSL mode!')
    # else:
    #     # Standard
    #     # tob_server_options = {'handler_class': box_FixedDebugHandler}
    #     tob_server = HTTPServer(host=box_host, port=box_port)
    #     # boxLog.notice('Operating with WSGIserver!')
    #
    # # if we're here ... almost everything is setup and running
    # # good time to launch the housekeeping for the first time!
    # session_housekeeping()
    #
    # http_or_https = 'http' if box_ssl is False else 'https'
    # boxLog.notice('Ready to listen on {}://{}:{}/'.format(http_or_https, tob_server.host, tob_server.port))
    #
    # try:
    #     if box_debug is True:
    #         run(theonionbox, server=tob_server, host=box_host, port=box_port)
    #     else:
    #         run(theonionbox, server=tob_server, host=box_host, port=box_port, quiet=True)
    # except KeyboardInterrupt:
    #     pass
    # except Exception as exc:
    #     raise exc
    # finally:
    #     exit_procedure(False)

    main(box_debug)

__all__ = ['main']
