#!/usr/bin/env python
from __future__ import absolute_import
from __future__ import print_function

# __version__ = '3.0.1'      # stamp will be added later
__version__ = '3.2RC3'      # stamp will be added later
__description__ = 'The Onion Box: WebInterface to monitor Tor Relays and Bridges'

# Testing purposes
# __family_fp__ = 'A3DB4954F7534E26C8C9B7E9B6A2672F8676B31C'
# __family_fp__ = 'DE14CB1310688E115115DAA1AA465FC4692152A7'

# from tob.version_tester import Version
# __version__ = Version(3, 0, 1)
#
# print(__version__)

# required pip's for raspberrypi
# stem
# bottle
# psutil
# configparser
# apscheduler (either v3.x or v2.x)
# requests

#####
# Standard Imports
import sys
import platform
from datetime import time

#####
# Module availability check
from pkgutil import find_loader

def warning(*objs):
    print(' ', *objs, file=sys.stderr)

module_missing = False

# First: psutils
if find_loader('psutil') is None:
    warning(__description__)
    warning("Required python module 'psutil' is missing.")
    module_missing = True
    host = platform.system
    if host == 'Linux':
        warning("You have to install it via 'pip install psutil'.")
        warning("If this fails, make sure the python headers are installed, too: 'apt-get install python-dev'.")
    elif host == 'Windows':
        warning("Check 'https://pypi.python.org/pypi/psutil' for an installer package.")
    else:
        warning("Check 'https://pypi.python.org/pypi/psutil' for installation instructions.")

# module name | extra info
required_modules = [
    'stem',
    'bottle',
    'configparser',
    'apscheduler',
    'requests'
]

for module_name in required_modules:
    if find_loader(module_name) is None:
        if module_missing is False:
            # Be nice and once print a header line!
            warning(__description__)
            warning('Version v{}'.format(__version__))
        warning("Required python module '{0}' is missing. You have to install it via 'pip install {0}'."
                .format(module_name))
        module_missing = True

if module_missing:
    warning("Hint: You need to have root privileges to operate 'pip'.")
    sys.exit(0)


#####
# Check proper setting of Timezone
# to compensate for a potential exception in the scheduler.
# Thanks to Sergey (senovr) for detecting this:
# https://github.com/ralphwetzel/theonionbox/issues/19#issuecomment-263110953

from tob.scheduler import Scheduler

# used to run all async activities within TOB
box_cron = Scheduler()
if box_cron.check_tz() is False:
    warning(__description__)
    warning("Unable to determine the name of the local timezone; please run 'tzinfo' to set it explicitely.")
    sys.exit(0)

#####
# Python version detection
py = sys.version_info
py34 = py >= (3, 4, 0)
py30 = py >= (3, 0, 0)

#####
# Host System detection
from psutil import virtual_memory
import platform

boxHost = {
    'system': platform.system(),
    'name': platform.node(),
    'release': platform.release(),
    'version': platform.version(),
    'machine': platform.machine(),
    'processor': platform.processor(),
    'memory': virtual_memory().total,
    'memory|MB': int(virtual_memory().total / (1024 ** 2))
}


#####
# Script directory detection
import inspect
import os
import sys


def get_script_dir(follow_symlinks=True):
    if getattr(sys, 'frozen', False): # py2exe, PyInstaller, cx_Freeze
        path = os.path.abspath(sys.executable)
    else:
        path = inspect.getabsfile(get_script_dir)
    if follow_symlinks:
        path = os.path.realpath(path)
    return os.path.dirname(path)

# to ensure that our directory structure works as expected!
os.chdir(get_script_dir())


#####
# Version Stamping
import os.path
stamped_version = str(__version__)
if os.path.exists('stamp.txt'):
    with open('stamp.txt', 'r') as f:
        lines = f.readlines()
        if len(lines) == 1 and lines[0][8] == '|':
            stamped_version += ' (stamp {})'.format(lines[0])


#####
# Command line interface

from getopt import getopt, GetoptError


def print_usage():
    print(__description__)
    print('Version v{}'.format(stamped_version))
    print(""
          "Command line parameters:"
          " -c <path> | --config=<path>: Provide path & name of configuration file."
          "                              Note: This is only necessary when NOT using"
          "                              './theonionbox.cfg' or './config/theonionbox.cfg'."
          " -d | --debug: Switch on 'Debug Mode'."
          " -h | --help: Prints this information."
          " -m <mode> | --mode=<mode>: Configure The Box to run as 'service'."
          "")

box_cmdline = {'config': None,
               'debug': False,
               'mode': None}

argv = sys.argv[1:]
opts = None

if argv:
    try:
        opts, args = getopt(argv, "c:dhm", ["config=", "debug", "help", 'mode='])
    except GetoptError as err:
        print(err)
        print_usage()
        sys.exit(0)
    for opt, arg in opts:
        if opt in ("-c", "--config"):
            box_cmdline['config'] = arg
        elif opt in ("-d", "--debug"):
            box_cmdline['debug'] = True
        elif opt in ("-h", "--help"):
            print_usage()
            sys.exit(0)
        elif opt in ('-m', '--mode'):
            if arg == 'service':
                box_cmdline['mode'] = 'service'
            else:
                print_usage()
                sys.exit(0)


#####
# The Logging Infrastructure
import logging
from logging.handlers import TimedRotatingFileHandler
from tob.tob_logging import addLoggingLevel, LoggingManager, ForwardHandler
from tob.tob_logging import ConsoleFormatter, FileFormatter

# Add Level to be inline with the Tor levels (DEBUG - INFO - NOTICE - WARN(ing) - ERROR)
addLoggingLevel('NOTICE', 25)

# valid level descriptors
boxLogLevels = ['DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR']

# This is the logger for Tor related messages.
# The clients will get their messages from this logger.
torLog = logging.getLogger('tor@theonionbox')
torLog.setLevel('DEBUG')
torLog.addHandler(logging.NullHandler())

# this will manage all MessageHandlers to receive Tor's events
# it will be instantiated later as soon as we've a contact to the Tor process
torLogMgr = None

# This is the logger to handle the 'BOX' messages.
# All messages targeted for the host are handled here!
boxLog = logging.getLogger('theonionbox')
boxLog.setLevel('DEBUG')
boxLog.addHandler(logging.NullHandler())

# This is the Handler to connect the boxLog with torLog
# as soon as we set it's target, all messages will be forwarded to this
boxFwrd = ForwardHandler(level=logging.NOTICE, tag='box')
boxLog.addHandler(boxFwrd)

# we keep the reference to this to allow changing of the Level at runtime
# ... when we've implemented this ;)!
box_handler = None

box_cmdline_modes = [None, 'service']

if box_cmdline['mode'] not in box_cmdline_modes:
    box_cmdline['mode'] = None

if box_cmdline['mode'] == 'service':
    if boxHost['system'] == 'Linux' or boxHost['system'] == 'FreeBSD':
        # I would prefer to write to /var/log/theonionbox ... yet someone with 'root' privileges has to create that
        # directory first and then set the proper rights. We test if this was done:
        boxLogPath = '/var/log/theonionbox'
        if os.access(boxLogPath, os.F_OK | os.W_OK | os.X_OK) is False:
            boxLogPath = 'log'

            # ensure that the 'log' directory exists
            # reasoning: if it doesn't, TimedRotatingFileHandler below will raise an exception!
            try:
                if py34:
                    os.makedirs(boxLogPath, exist_ok=True)
                else:
                    os.makedirs(boxLogPath)
            except OSError:
                if not os.path.isdir(boxLogPath):
                    raise

        boxLogPath += '/theonionbox.log'
        box_handler = TimedRotatingFileHandler(boxLogPath, when='midnight', backupCount=5)
        ff = FileFormatter()
        box_handler.setFormatter(ff)
        boxLog.addHandler(box_handler)
    else:
        # we'll emit this message later!
        # boxLog.warning('Running as --mode=service currently not supported on Windows Operating System.')
        box_cmdline['mode'] = 'WrongOS'


def log_encoder(string):
    # Escape HTML special characters ``&<>``, slashes '\/' and quotes ``'"``
    return string.replace('&','&amp;').replace("\\",'&#92;').replace("/",'&#47;')\
        .replace('<','&lt;').replace('>','&gt;')\
        .replace('"','&quot;').replace("'",'&#039;')


if box_cmdline['mode'] != 'service':
    # Log to console
    box_handler = logging.StreamHandler(sys.stdout)
    cf = ConsoleFormatter()
    box_handler.setFormatter(cf)
    boxLog.addHandler(box_handler)

boxLog.setLevel('DEBUG')
box_handler.setLevel('DEBUG')

# Here we go!
boxLog.notice('')
boxLog.notice(__description__)
boxLog.notice('Version v{}'.format(stamped_version))
boxLog.info('Running on a {} Host.'.format(boxHost['system']))
boxLog.info('Python version is {}.{}.{}.'.format(sys.version_info.major,
                                                 sys.version_info.minor,
                                                 sys.version_info.micro))


if box_cmdline['debug'] is True:
    boxLog.notice('Debug Mode activated from command line.')

if box_cmdline['mode'] is 'WrongOS':
    boxLog.warning('Running as --mode=service currently not supported on {} Operating Systems.'
                   .format(boxHost['system']))



#####
# General stuff
# import sys
import json                                     # to prepare the LiveData for transmission
import uuid                                     # e.g. for authentication
from collections import deque
import functools
import itertools
from threading import RLock
from datetime import datetime

#####
# TOR manpage Index Information

from tob.manpage import ManPage
box_manpage = ManPage('tor/tor.1.ndx')

#####
# Configuration Management
import configparser     # to read the config file

# Location and name of config files
box_config_path = 'config'
box_config_file = 'theonionbox.cfg'

# Tor SOCKS Proxy
tor_proxy = None

# Configuration of the connection to the TOR Relay
tor_control = 'port'
tor_host = 'localhost'
tor_port = 9090
tor_socket = '/var/run/tor/control'
tor_timeout = -1 # will become 'None' later ...
tor_ttl = 60
tor_ERR = True
tor_WARN = True
tor_NOTICE = True

# Configuration of this server
box_host = 'localhost'
box_port = 8080
box_session_ttl = 30
box_server_to_use = None        # Deprecated since v3.2RC3
box_ntp_server = 'pool.ntp.org'
box_message_level = 'NOTICE'
box_basepath = ''

box_ssl = False
box_ssl_certificate = ''
box_ssl_key = ''

# Read the config file(s)
config_found = False
config_files = [box_config_file, box_config_path + '/' + box_config_file]
config = configparser.ConfigParser()
if box_cmdline['config'] is not None:
    config_files = [box_cmdline['config']] + config_files

for config_file in config_files:
    if config.read(config_file):
        boxLog.notice("Operating with configuration from '{}'".format(config_file))
        config_found = True
        break
    else:
        boxLog.warning("Failed to load configuration from '{}'".format(config_file))

if not config_found:
    boxLog.warning('No configuration file found; searched at: {}'.format(config_files))

if 'TheOnionBox' in config:
    box_config = config['TheOnionBox']
    box_host = box_config.get('host', box_host)
    box_port = int(box_config.get('port', box_port))
    box_server_to_use = box_config.get('server', box_server_to_use)
    box_session_ttl = int(box_config.get('session_ttl', box_session_ttl))
    box_ssl = box_config.getboolean('ssl', box_ssl)
    box_ssl_certificate = box_config.get('ssl_certificate', box_ssl_certificate)
    box_ssl_key = box_config.get('ssl_key', box_ssl_key)
    box_ntp_server = box_config.get('ntp_server', box_ntp_server)
    box_message_level = box_config.get('message_level', box_message_level).upper()
    box_basepath = box_config.get('proxy_path', box_basepath)

if 'TorRelay' in config:
    tor_config = config['TorRelay']
    tor_control = tor_config.get('tor_control', tor_control)
    tor_host = tor_config.get('tor_host', tor_host)
    tor_port = int(tor_config.get('tor_control_port', tor_port))
    tor_socket = tor_config.get('tor_control_socket', tor_socket)
    tor_timeout = int(tor_config.get('tor_control_timeout', tor_timeout))
    tor_ttl = int(tor_config.get('tor_ttl', tor_ttl))
    tor_ERR = tor_config.getboolean('tor_preserve_ERR', tor_ERR)
    tor_WARN = tor_config.getboolean('tor_preserve_WARN', tor_WARN)
    tor_NOTICE = tor_config.getboolean('tor_preserve_NOTICE', tor_NOTICE)

if 'TorProxy' in config:
    from stem.util.connection import is_valid_ipv4_address, is_valid_ipv6_address

    tor_proxy = config['TorProxy'].get('tor_proxy', tor_proxy)
    if tor_proxy is not None:
        if not (is_valid_ipv4_address(tor_proxy) or is_valid_ipv6_address(tor_proxy, True)):
            tor_proxy = None

# TODO: Validate here that we've read reasonable data from the config file
if tor_timeout < 0:
    tor_timeout = None

# v3.2RC3
if box_server_to_use is not None:
    boxLog.warn("Configuration: Parameter 'server' is deprecated and will be ignored.")

if box_message_level not in boxLogLevels:

    msg = "Configuration: Wrong parameter '{}' declared for 'message_level'.".format(box_message_level)

    # this check is to prevent ambiguities in case we're in --debug mode (where we do NOT default to 'NOTICE'!)
    if box_cmdline['debug'] is False:
        msg += " Defaulting to 'NOTICE'."

    boxLog.warning(msg)
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

# Socket validation
if tor_control != 'socket':
    tor_control = 'port'

if tor_control is 'socket':
    # TODO: Check for PySocks if SOCKS support is demanded!
    if find_loader('pysocks') is None:
        boxLog.error("To access Tor via sockets you have to install python module 'pysocks': 'pip install pysocks'")
        sys.exit()

if box_ssl is True:
    if find_loader('ssl') is None:
        boxLog.error("To operate via SSL you have to install python module 'ssl': 'pip install ssl'")
        sys.exit()

    #####
# Set DEBUG mode and Message Level
#
# box_debug is used to
#   * enable the debug mode of bottle

box_debug = box_cmdline['debug']

if box_cmdline['debug'] is True:
    box_debug = True
    boxLog.setLevel('DEBUG')
    box_handler.setLevel('DEBUG')
else:
    box_debug = False
    boxLog.info("Switching to Message Level '{}'.".format(box_message_level))
    boxLog.setLevel('DEBUG')
    box_handler.setLevel(box_message_level)

#####
# Time Management
from time import time
# from tob_time import TimeManager
from tob.tob_time import getTimer
box_time = getTimer()
box_time.setNTP(box_ntp_server)


def update_time_deviation():

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

import os

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

if boxHost['temp']:
    boxLog.notice('Temperature sensor information located in file system. Expect to get a chart!')
else:
    boxLog.notice('No temperature sensor information found.')

#####
# Uptime Detection
#
# http://planzero.org/blog/2012/01/26/system_uptime_in_python,_a_better_way
# currently only supported runnig on Linux!

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
    from datetime import timedelta

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
    from datetime import datetime

    try:
        uptimes = subprocess.check_output('/usr/bin/who -b', shell=True).decode('utf-8').split()
    except:
        pass
    else:
        # expected output format is now e.g. 'system boot   MMM dd hh:mm'
        if len(uptimes) == 5 and uptimes[0] == 'system' and uptimes[1] == 'boot':

            try:
                # Currently there is no YEAR data in the returned string!
                # Therefore this could crash around January 2017!!
                upt = datetime.strptime(' '.join(uptimes[2:]), '%b %d %H:%M')
            except Exception as exc:
                boxLog.warning('Uptime information parsing error: {}'.format(exc))
            else:
                if upt.year == 1900:
                    its_now = datetime.fromtimestamp(box_time.time())
                    upt = upt.replace(year=its_now.year)

                boxHost['up'] = upt

if boxHost['up']:
    boxLog.notice('Uptime information located. Expect to get a readout!')
else:
    boxLog.notice('No uptime information available.')

#####
# READY to GO!

#####
# Run the Scheduler
box_cron.start()

#####
# SESSION Management
from tob.session import SessionFactory, make_short_id

# standard session management
box_sessions = SessionFactory(box_time, box_session_ttl)


#####
# Live Data Management
from tob.livedata import LiveDataManager

#####
# Management of ...
# ... the Live Bandwidth Data
tor_livedata = LiveDataManager()
# ... the CPU Load
host_cpudata = deque(maxlen=300)        # CPU Load and Memory load; length = 300 seconds
host_cpudata_lock = RLock()

# ... cumulated Bandwidth information
tor_bwdata = {'upload': 0, 'download': 0, 'limit': 0, 'burst': 0, 'measure': 0}


#####
# Tor interface
from stem.control import EventType
from tob.controller import tobController

# The Tor interface
tor = None  # -> tobController
tor_password = None


def connect2tor(tor=None):

    from stem import SocketError

    if tor is not None:
        return tor

    try:
        if tor_control == 'socket':
            boxLog.notice("Trying to connect to Tor ControlSocket @ '{}'...".format(tor_socket))
            tor = tobController.from_socket_file(tor_socket, tor_timeout)
        else:
            boxLog.notice('Trying to connect to Tor ControlPort {}:{}...'.format(tor_host, tor_port))
            if tor_timeout:
                boxLog.notice('Timeout set to {}s.'.format(tor_timeout))
            tor = tobController.from_port_timeout(tor_host, tor_port, tor_timeout)
    except SocketError as err:
        boxLog.warning('Failed to connect: {}'.format(err))
        raise err

    boxLog.notice('Connected!')

    # onionoo.add(tor.get_fingerprint())

    # ensure that our tor related information is aways current
    update_tor_info()
    box_cron.add_job(update_tor_info, 'interval', minutes=1)

    # start the event handler for the Bandwidth data
    tor.add_event_listener(functools.partial(handle_livedata), EventType.BW)

    return tor

# this will be called by a cron job each minute once!
def update_tor_info():

    try:
        tor.refresh()

    except:
        pass

tor_conf = []
def update_tor_conf():

    if tor is None:
        return

    # get all valid configuration names (only and drop attached information)
    config_names = tor.get_info('config/names')
    names_with_values = config_names.splitlines()
    names_only = [line.split(' ')[0].lower() for line in names_with_values]

    # get the used configuration files
    # could be up to two (depending on the tor version)
    tor_cf = []

    # this one should be available always
    cf = ''
    try:
        cf = tor.get_info('config-file', '')
    except:
        pass
    if len(cf):
        tor_cf.append(cf)

    # this was first implemented in 0.2.3.9-alpha
    cf = ''
    try:
        cf = tor.get_info('config-defaults-file', '')
    except:
        pass
    if len(cf):
        tor_cf.append(cf)

    # read defined parameters from the config files (if used)
    # and verify them with the valid parameter names
    out = []
    for conf_file in cf:
        lines = []
        try:
            with open(conf_file) as file:
                lines = file.readlines()
        except:
            pass
        for line in lines:
            line.lstrip()   #strip white spaces at the beginning of the line
            if line[0] != '#':  # check if it's a comment
                token = line.split(' ')[0].lower()    # if not: get the first token
                if token:
                    if (token not in out) and (token in names_only):    # and record this to the result - if new
                        out.append(token)


    # finally get the command line and check if there are parameters defined additionally
    from psutil import Process
    cmd_line = ''
    try:
        pid = tor.get_pid(0)
        if pid:
            prc = Process(pid)
            if prc:
                cmd_line = prc.cmdline()
    except:
        pass

    if len(cmd_line)> 0:
        boxLog.notice("TODO: Parse Commandline -> {}".format(cmd_line))

    if len(out) > 0:
        out.sort()
        tor_conf = out
        print(out)

def handle_conf_changed(event):
    print('handle_conf_changed!!')
    print(event)


#####
# ONIONOO Protocol Interface

from tob.onionoo import OnionOOFactory, Details, Bandwidth, Weights, Mode

onionoo_mode = Mode.OPEN
# proxy = '192.168.178.28:9050'

if tor_proxy is not None:
    onionoo_mode = Mode.HIDDEN

onionoo = OnionOOFactory(tor_proxy)

def refresh_onionoo(relaunch_job=False):

    from random import randint

    # fp = tor.get_fingerprint() if tor else None

    # if fp is not None:
    #   onionoo.add(fp)
    onionoo.refresh()

    if box_cron.get_job('onionoo') is not None:
        return

    # schedule the next run...
    if relaunch_job:
        next_run = int(box_time()) + randint(3600*4, 3600*12)
        run_date = datetime.fromtimestamp(next_run)
        boxLog.info('Next scheduled retry to refresh ONIONOO @ {}'.format(run_date.strftime('%Y-%m-%d %H:%M:%S')))
        box_cron.add_job(refresh_onionoo, 'date', id='onionoo', run_date=run_date, args=[True])

    return


#####
# Cumulated Bandwidth information

def refresh_bw():

    try:
        tr = int(tor.get_info('traffic/read'))
        tw = int(tor.get_info('traffic/written'))
    except:
        pass
    else:
        tor_livedata.set_traffic(tr, tw)
    finally:
        if box_cron.get_job('bw') is not None:
            return

        box_cron.add_job(refresh_bw, 'interval', id='bw', minutes=5)


#####
# BOTTLE
from bottle import Bottle, run, debug
from bottle import redirect, template, static_file
from bottle import request
from bottle import HTTPError, HTTPResponse

import bottle

# set the bottle debug mode
# debug(box_debug)
debug(False)

# jQuery version
# jQuery_lib = "jquery-1.11.2.js"
# jQuery_lib = "jquery-1.12.2.min.js"
jQuery_lib = "jquery-3.1.1.min.js"

# Bootstrap
bootstrapVersion = '3.3.7'
bootstrapDir = 'bootstrap-' + bootstrapVersion
if box_debug:
    bootstrapJS="bootstrap.js"
    bootstrapCSS = "bootstrap.css"
else:
    bootstrapJS = "bootstrap.min.js"
    bootstrapCSS = "bootstrap.min.css"


# Our WebServer implementation
theonionbox = Bottle()
theonionbox_name = 'The Onion Box'

# to redirect the bottle() output to our logging framework
bottle._stderr = boxLog.info
bottle._stdout = boxLog.debug


#####
#  The Authentication System

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


def authenticate_login(login, request):

    raise_err = True
    realm = "user@TheOnionBox"
    auth_method = "TheOnionBox"

    header = request.environ.get('HTTP_AUTHORIZATION', '')
    if header != '':
        try:
            method, data = header.split(None, 1)
            if method == auth_method:

                # Basic Authentication
                if login['auth'] == 'basic':
                    user, pwd = touni(b64decode(tob(data))).split(':', 1)

                    if user == login.id():
                        if tor_authenticate(pwd):
                            raise_err = False

                # Digest Authentication
                elif login['auth'] == 'digest':

                    # the data comes as in as 'key1="xxx...", key2="xxx...", ..., key_x="..."'
                    # therefore we split @ ', '
                    # then remove the final '"' & split @ '="'
                    # to create a nice dict.
                    request_data = dict(item[:-1].split('="') for item in data.split(", "))

                    ha1_prep = (login.id() + ":" + realm + ":" + tor_password).encode('utf-8')
                    ha1 = md5(ha1_prep).hexdigest()
                    ha2_prep = (request.method + ":" + request_data['uri']).encode('utf-8')
                    ha2 = md5(ha2_prep).hexdigest()
                    resp_prep = (ha1 + ":{}:".format(login['nonce']) + ha2).encode('utf-8')
                    response = md5(resp_prep).hexdigest()

                    if response == request_data['response']:
                        if tor_authenticate(tor_password):
                            raise_err = False

        except:
            pass

    if raise_err:
        err = HTTPError(401, 'Access denied!')

        # Request Basic Authentication
        if login['auth'] == 'basic':
            err.add_header('WWW-Authenticate', '{} realm = {}'.format(auth_method, realm))

        # Request Digest Authentication
        else:
            login['nonce'] = uuid.uuid1().hex
            login['opaque'] = uuid.uuid4().hex
            header = '{} realm={}, nonce={}, opaque={}'.format(auth_method, realm, login['nonce'], login['opaque'])
            err.add_header('WWW-Authenticate', header)

        raise err


def tor_authenticate(password):

    log = logging.getLogger('theonionbox')
    log.debug('tor.is_alive(): {}'.format(tor.is_alive()))

    # check if there is a connection to TOR
    if not tor.is_alive():
        try:
            tor.connect()
        except:
            return False
        log.debug('tor.is_alive() after connect(): {}'.format(tor.is_alive()))

    global tor_password

    log.debug('tor.is_authenticated(): {}'.format(tor.is_authenticated()))
    if tor.is_authenticated():
        return password == tor_password
    else:
        retval = False
        try:
            tor.authenticate_password(password=password)
            tor_password = password
            retval = True
        except Exception as exc:
            log.debug('tor.authenticated() raised: {}'.format(exc))
        finally:
            log.debug('tor.is_authenticated() after authenticate_password(): {}'.format(tor.is_authenticated()))

        return retval

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
js_template = functools.partial(template, template_settings={'syntax': '/* */ // {{ }}'})


# The sections of the index page
box_sections = ['!header', 'header',
                '!content', 'general', 'config', 'local',
                'network', 'network_bandwidth', 'network_weights', '-',
                'accounting', 'monitor', 'family', 'messages',
                'license']

# The sections of the login page
login_sections = ['!header', 'header', '!content', 'login', 'license']

# The sections of the error page
error_sections = ['!header', 'header', '!content', 'error', 'license']

# Additional DEBUG information
if box_debug:
    @theonionbox.hook('before_request')
    def debug_request():
        boxLog.debug(request.environ['PATH_INFO'])


# Default Landing Page
@theonionbox.get('/')
def get_start():

    global tor

    session = box_sessions.create(request.remote_addr, 'login')

    if session is None:
        raise HTTPError(404)

    try:
        if tor is None:
            tor = connect2tor(tor)
            torLogMgr.connect2tor(tor)

    except Exception as err:
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
            , 'tor': tor
            , 'session_id': session.id()
            , 'icon': theonionbox_icon
            , 'box_version': stamped_version
            , 'virtual_basepath': box_basepath
            , 'sections': error_sections
            , 'section_config': section_config
            , 'error_msg': err
            , 'box.js_login': True  # flag to manipulate the creation process of 'box.js'
        }

        # prepare the includes
        session['box.js'] = template('scripts/box.js', **params)
        session['box.css'] = template('css/box.css', **params)
        session['fonts.css'] = template('css/latolatinfonts.css', **params)

    else:
        # Standard login Page delivery
        session['auth'] = 'digest' if tor_password else 'basic'

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
            'timeout': box_session_ttl * 1000   # js!
        }

        params = {
            'session': session
            , 'tor': tor
            , 'session_id': session.id()
            , 'icon': theonionbox_icon
            , 'box_version': stamped_version
            , 'virtual_basepath': box_basepath
            , 'sections': login_sections
            , 'section_config': section_config
            , 'box.js_login': True  # flag to manipulate the creation process of 'box.js'
        }

        # prepare the includes
        session['box.js'] = template('scripts/box.js', **params)
        session['box.css'] = template('css/box.css', **params)
        session['fonts.css'] = template('css/latolatinfonts.css', **params)

        if 'auth' in session:
            if session['auth'] == 'basic':
                session['auth.js'] = template('scripts/authrequest_basic.js', virtual_basepath=box_basepath)
            else:  # e.g. if login['auth'] == 'digest'
                session['auth.js'] = template('scripts/authrequest_digest.js'
                                , md5_js_file='scripts/md5.js'
                                , virtual_basepath=box_basepath)

    # deliver the login page
    return template("pages/index.html", **params)


@theonionbox.get('/<login_id>/login.html')
def perform_login(login_id):

    boxLog.debug("{}@{} requests '{}'".format(make_short_id(login_id), request.remote_addr, 'login.html'))
    boxLog.debug("{}: addr = {} / route = {}".format(make_short_id(login_id), request.remote_addr, request.remote_route))

    login_session = box_sessions.recall(login_id, request.remote_route[0])

    if login_session is None:
        redirect(box_basepath + '/')
        return False  # necessary?

    if login_session['status'] != 'login':
        box_sessions.delete(login_session.id())
        redirect(box_basepath + '/')
        return False  # necessary?

    try:
        authenticate_login(login_session, request)
    except HTTPError:
        raise

    # at this stage we have a successful login
    # and switch to standard session management
    active_session = box_sessions.create(login_session.remote_addr(),'prepared')
    boxLog.info("{}@{} received session token '{}'; immediate response expected."
                   .format(login_session.id_short(), login_session.remote_addr(), active_session.id_short()))
    box_sessions.delete(login_session.id())

    active_session['prep_time'] = box_time()

    return active_session.id()

# This is the standard page!
@theonionbox.get('/<session_id>/index.html')
def get_index(session_id):

    from stem import SocketError

    session = box_sessions.recall(session_id, request.remote_addr)

    # this is better than asserting!
    if session is None:
        redirect(box_basepath + '/')
        return False    # necessary?

    status = session.get('status', None)

    if status == 'prepared':

        #TODO: RDW 20160913 shouldn't this be session[prep_time] ?
        delay = box_time() - session.last_visit

        if delay > 2.0:  # seconds
            session['status'] = 'toolate'   # ;)
            boxLog.info('{}@{}: Login to Session delay expired. Session canceled.'
                           .format(session.id_short(), session.remote_addr()))
        else:
            session['status'] = 'ok'
            # we have a successfull connection! Celebrate this!
            boxLog.notice('{}@{}: Session established.'.format(session.id_short(), session.remote_addr()))

    if session['status'] != 'ok':
        box_sessions.delete(session.id())
        redirect(box_basepath + '/')
        return False

    #This should create an exception if the socket was closed unexpectedly
    try:
        version_short = tor.get_version_short()
    except SocketError:
        boxLog.warning('SocketError while initiating index.html creation process.')
        # we lost the authentication. Therefore: Redirect!
        box_sessions.delete(session.id())
        redirect(box_basepath + '/')
        return False

    try:
        ec = tor.get_info('bw-event-cache')
        ecl = ec.split(' ')
    except:
        pass
    boxLog.debug((len(ecl)))
    boxLog.debug(print(ecl))

    # get the onionoo data
    fp = tor.get_fingerprint()
    onionoo.add(fp)
    onionoo.refresh(only_keys_with_none_data=True, async=False)

    onionoo_details = onionoo.details(fp)
    onionoo_bw = onionoo.bandwidth(fp)
    onionoo_weights = onionoo.weights(fp)

    # asyncronously refreshing the onionoo data
    refresh_onionoo()

    __family_fp__ = fp
    # for testing purposes of the family performance
    # onionoo.add(__family_fp__)
    # onionoo.refresh(True, True)

    family_details = onionoo.details(__family_fp__)
    fams = ['effective_family', 'alleged_family', 'indirect_family']

    for fam in fams:
        fam_det = family_details(fam)
        if fam_det is not None:
            for fp in fam_det:
                if fp[0] is '$':
                    onionoo.add(fp[1:])

    onionoo.refresh(True)

    # asyncronously refreshing the bandwidth data
    refresh_bw()

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
    onionoo_show = onionoo_details.has_data() or onionoo_bw.has_data() or onionoo_weights.has_data()

    # setup the MessageHandler for this session
    torLogMgr.add_client(session_id)

    # prepare the preserved events for hardcoded transfer
    p_ev = torLogMgr.get_events(session_id, encode=log_encoder)

    accounting_stats = {}
    try:
        accounting_stats = tor.get_accounting_stats()
        accounting_switch = True
    except:
        accounting_switch = False

    # print(tor.get_info('config/names'))

    session['stylesheets'] = ['bootstrap.css', 'fonts.css', 'box.css']
    session['scripts'] = ['jquery.js', 'bootstrap.js', 'smoothie.js', 'chart.js', 'box.js']

    import socket

    section_config = {}
    section_config['header'] = {
        'logout': True,
        'title': tor.get_nickname(),
        'subtitle': "Tor {} @ {}<br>{}".format(version_short, socket.gethostname(), tor.get_fingerprint()),
        'powered': "monitored by <b>The Onion Box</b> v{}".format(stamped_version)
    }

    params = {
        'session': session
        , 'read_bytes': tor_bwdata['download']
        , 'written_bytes': tor_bwdata['upload']
        , 'tor': tor
        , 'host': boxHost
        , 'session_id': session_id
        , 'preserved_events': p_ev
        , 'server_time': box_time()
        , 'accounting_on': accounting_switch
        , 'accounting_stats': accounting_stats
        , 'icon': theonionbox_icon
        , 'marker': icon_marker
        , 'box_version': stamped_version
        , 'box_debug': box_debug
        , 'virtual_basepath': box_basepath
        , 'sections': box_sections
        , 'manpage': box_manpage
        , 'oo_show': onionoo_show
        , 'oo_details': onionoo_details
        , 'oo_bw': onionoo_bw
        , 'oo_weights': onionoo_weights
        , 'section_config': section_config
        , 'oo_factory': onionoo
        , 'family_fp': __family_fp__
    }

    # Test
#    from bottle import SimpleTemplate
#    tpl = SimpleTemplate(name='scripts/box.js')
#    tpl.prepare(syntax='/* */ // {{ }}')
#    bjs = tpl.render(**params)

    # prepare the includes
    session['box.js'] = js_template('scripts/box.js', **params)
    session['box.css'] = template('css/box.css', **params)
    session['fonts.css'] = template('css/latolatinfonts.css', **params)

    # deliver the main page
    return template("pages/index.html", **params)


@theonionbox.get('/<session_id>/logout.html')
def get_logout(session_id):

    session = box_sessions.recall_unsafe(session_id)

    if session is not None:
        boxLog.notice('{}@{}: Active LogOut!'.format(session.id_short(), session.remote_addr()))
        box_sessions.delete(session_id)
    else:
        boxLog.warning('LogOut requested from unknown client: {}@{}'.format(make_short_id(session_id), request.remote_addr))

    redirect(box_basepath + '/')


@theonionbox.get('/<session_id>/manpage.html')
def get_manpage(session_id):
    session = box_sessions.recall(session_id, request.remote_addr)
    if session is None or session['status'] != 'ok':
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
    if status not in ['login', 'ok', 'error']:
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

    return static_file('LatoLatin/fonts/' + filename, root='font', mimetype=mime_type[fxtension])


@theonionbox.post('/<session_id>/data.html')
def post_data(session_id):

    session = box_sessions.recall(session_id, request.remote_addr)

    # this is better than asserting!
    if session is None:
        raise HTTPError(404)

    if session['status'] != 'ok':
        raise HTTPError(503)

    tts = tor.get_timestamp()
    its_now = int(box_time()) * 1000    # JS!

    return_data_dict = {'tick': its_now}

    # general
    if 'general' in box_sections:

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

            for key in rl_dict:
                torLogMgr.switch(session_id, key, rl_dict[key])

        log_list = torLogMgr.get_events(session_id, encode=log_encoder)

        if len(log_list) > 0:
            return_data_dict['msg'] = log_list

    # operations monitoring
    if 'monitor' in box_sections:

        if ('monitor' not in session) or (session['monitor'] == 0):
            hd_list = tor_livedata.get_data_hd()
            ld_list = tor_livedata.get_data_ld()
        else:
            last_ts = session['monitor']
            hd_list = tor_livedata.get_data_hd_since(since_timestamp=last_ts)
            ld_list = tor_livedata.get_data_ld_since(since_timestamp=last_ts)

        return_data_dict['mon'] = {'hd': hd_list, 'ld': ld_list}

        # this little hack ensures, that we deliver data on the
        # first *two* calls after launch!
        session['monitor'] = its_now if 'monitor' in session else 0

    if 'network' in box_sections:
        # Once there was code here.
        # It's no more ;) !
        pass

    # get the onionoo data
    fp = tor.get_fingerprint()
    onionoo_details = onionoo.details(fp)
    onionoo_bw = onionoo.bandwidth(fp)
    onionoo_weights = onionoo.weights(fp)

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

            family_data = {}    # the read / write data for one node; key = fingerprint of node [1:]
            family_nodes = []   # list of fingerprints of the nodes [1:]

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
                        node_fp = fp[1:]
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

    css_files = []
    status = session['status']

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
            return static_file(bootstrapCSS, root=bootstrapDir + '/css', mimetype='text/css')
        else:
            return static_file(filename, root='css', mimetype='text/css')

    raise HTTPError(404)


@theonionbox.get('/<session_id>/<filename:re:.*\.js>')
def send_js(session_id, filename):

    session = box_sessions.recall(session_id, request.remote_addr)
    if session is None:
        raise HTTPError(404)

    js_files = []
    status = session['status']

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
            return static_file(bootstrapJS, root=bootstrapDir + '/js', mimetype='text/javascript')
        elif filename == 'jquery.js':
            return static_file(jQuery_lib, root='scripts', mimetype='text/javascript')
        else:
            return static_file(filename, root='scripts', mimetype='text/javascript')

    raise HTTPError(404)


def handle_livedata(event):

    if event is None:
        return False

    # record the data of the CPU
    record_cpu_data()

    # now manage the bandwidth data
    tor_livedata.record_bandwidth(time_stamp=event.arrived_at
                                  , bytes_read=event.read
                                  , bytes_written=event.written)

    return True


def record_cpu_data(timestamp=None, compensate_deviation=True):

    from psutil import virtual_memory, cpu_percent, cpu_count  # to readout the cpu load

    if timestamp is None:
        timestamp = time()

    if compensate_deviation is True:
        timestamp = box_time(timestamp)

    timestamp *= 1000   # has to be converted to ms as JS expects ms!

    # we always catch the current cpu load
    cpu = {}
    count = 0

    # first: overall cpu load:
    cpu['c'] = cpu_percent(None, False)

    # to indicate values according to the logic of the Windows Task Manager
    if boxHost['system'] == 'Windows':
        cpu['c'] /= cpu_count()

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

    # append the data to the list
    host_cpudata_lock.acquire()
    host_cpudata.append(cpu)
    host_cpudata_lock.release()


#####
# Custom Server Adapters to allow shutdown() of the servers
# 20160925: WHICH CURRENTLY DOESN'T WORK
#

from bottle import ServerAdapter
from wsgiref.simple_server import WSGIRequestHandler

# patched handler to output messages via our event_manager
class box_FixedDebugHandler(WSGIRequestHandler):

    def address_string(self): # Prevent reverse DNS lookups please.
        return self.client_address[0]

    def log_request(*args, **kw):
            return WSGIRequestHandler.log_request(*args, **kw)

    def log_message(self, format, *args):
        payload = format % args
        boxLog.debug("{}: {}".format(self.address_string(), payload))

class ShutDownAdapter(object):
    server = None

    def shutdown(self):
        pass


# This is our new (v3) default server
# https://fgallaire.github.io/wsgiserver/
class HTTPServer(ServerAdapter):

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

    # 2.2: check for expired session
    if box_sessions is not None:

        while True:
            expired_session_id = box_sessions.check_for_expired_session(remove_expired_session=False)

            if expired_session_id is None:
                break

            session = box_sessions.recall_unsafe(expired_session_id)
            if session is not None:
                boxLog.notice('{}@{}: Session expired.'.format(session.id_short(), session.remote_addr()))
            box_sessions.delete(expired_session_id)

            # un-subscribe this session_id from the event handling
            if torLogMgr:
                torLogMgr.remove_client(expired_session_id)

    global tor_password

    # 4: closing connection to tor
    # if this is requested
    if tor and tor.is_authenticated() and tor_ttl > 0:   # <==0 => don't ever close the connection!

        current_time = int(box_time())
        lv = box_sessions.latest_visit()
        if lv is not None:  # indicates that there's been no connection at all!
            if current_time - lv > tor_ttl:
                msg = 'No more client activity for {} seconds. Trying to close the connection to TOR: '\
                    .format(int(current_time - lv))
                try:
                    tor.close()
                except:
                    pass

                if tor.is_alive():
                    msg += 'Failed!'
                else:
                    msg += 'Done!'
                    tor_password = None
                    box_sessions.reset()
                    msg += ' All sessions expired!'

                    # ensure that the charts look nice when we reconnect
                    # see _handle_livedata for further details!
                    record_cpu_data(timestamp=current_time)
                    tor_livedata.record_bandwidth(time_stamp=current_time)

                boxLog.notice(msg)


box_cron.add_job(session_housekeeping, 'interval', seconds=housekeeping_interval)


def exit_procedure(quit=True):

    try:
        # Python 3.x
        from threading import active_count
    except ImportError:
        # Python 2.x
        from threading import activeCount
        active_count = activeCount

    from threading import enumerate

    boxLog.debug('ShutDown Initiated...')

    boxLog.debug('Shutting down webserver...')
    try:
        tob_server.shutdown()
    except Exception as exc:
        boxLog.warning("During ShutDown of WebServer: {}".format(exc))

    if tor is not None:
        boxLog.debug('Closing connection to Tor...')
        tor.close()

    boxLog.debug('Terminating cron jobs...')
    try:
        box_cron.shutdown()
    except Exception as exc:
        boxLog.warning("During ShutDown of Cron: {}".format(exc))

    boxLog.debug('Terminating onionoo management...')
    try:
        onionoo.shutdown()
    except Exception as exc:
        boxLog.warning("During ShutDown of onionoo: {}".format(exc))

    # List of running Threads
    lort = ''
    for th in enumerate():
        if len(lort) > 0:
            lort += ', '
        lort += th.name

    boxLog.debug("List of threads still running (should only be 'MainThread'): {}".format(lort))

    if quit:
        sys.exit(0)

if __name__ == '__main__':

    try:
        tor = connect2tor()
    except:
        boxLog.notice('Trying again later...')

    # Now we can establish the Handlers for Tor's messages
    # ... even if we failed to connect to Tor!
    torLogMgr = LoggingManager(tor, notice=tor_NOTICE, warn=tor_WARN, err=tor_ERR)
    # and enable the Forwarder
    boxFwrd.setTarget(torLog)

    update_time_deviation()

    tob_server = None

    if box_ssl is True:
        # SSL enabled
        tob_server = HTTPServer(host=box_host, port=box_port, certfile=box_ssl_certificate, keyfile=box_ssl_key)
        boxLog.notice("Operating with WSGIserver in SSL mode!")
    else:
        # Standard
        # tob_server_options = {'handler_class': box_FixedDebugHandler}
        tob_server = HTTPServer(host=box_host, port=box_port)
        boxLog.notice('Operating with WSGIserver!')

    # if we're here ... almost everything is setup and running
    # good time to launch the housekeeping for the first time!
    session_housekeeping()

    http_or_https = 'http' if box_ssl is False else 'https'
    boxLog.notice('Ready to listen on {}://{}:{}/'.format(http_or_https, tob_server.host, tob_server.port))

    try:
        if box_debug is True:
            run(theonionbox, server=tob_server, host=box_host, port=box_port)
        else:
            run(theonionbox, server=tob_server, host=box_host, port=box_port, quiet=True)
    except KeyboardInterrupt:
        pass
    except Exception as exc:
        raise exc
    finally:
        exit_procedure(False)


