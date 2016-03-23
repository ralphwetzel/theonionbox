#!/usr/bin/python

__version__ = '3.0dev/debug'

# required pip's for raspberrypi
# stem
# bottle
# psutil
# configparser
# apscheduler

#####
# Standard Imports
import sys
from datetime import time

#####
# Python version detection
py = sys.version_info
py34 = py >= (3, 4, 0)

#####
# Operating System detection
import platform
boxOS = platform.system()

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
# Command line interface

from getopt import getopt, GetoptError


def print_usage():
    print('The Onion Box v{}: WebInterface for Tor Relays'.format(__version__))
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
from tob_logging import addLoggingLevel, LoggingManager, ForwardHandler
from tob_logging import ConsoleFormatter, FileFormatter

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

# This is the looger to handle the 'BOX' messages.
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
    if boxOS == 'Linux':
        # I would prefer to write to /var/log/theonionbox ... yet someone with 'root' privileges has to create that
        # directory first and then set the propper rights. We test if this was done:
        boxLogPath = '/var/log/theonionbox'
        if os.access(boxLogPath, os.F_OK | os.W_OK | os.X_OK) is False:
            boxLogPath = 'log'
        boxLogPath += '/theonionbox.log'
        if py34:
            box_handler = TimedRotatingFileHandler(boxLogPath, 'm', interval=2, backupCount=5, atTime=time())
        else:
            box_handler = TimedRotatingFileHandler(boxLogPath, 'm', interval=2, backupCount=5)
        ff = FileFormatter()
        box_handler.setFormatter(ff)
        boxLog.addHandler(box_handler)
    else:
        # we'll emit this message later!
        # boxLog.warning('Running as --mode=service currently not supported on Windows Operating System.')
        box_cmdline['mode'] = 'WrongOS'

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
boxLog.notice('The Onion Box v{}: WebInterface for Tor Relays'.format(__version__))
boxLog.notice('Running on a {} Host.'.format(boxOS))

if box_cmdline['debug'] is True:
    boxLog.notice('Debug Mode activated from command line.')

if box_cmdline['mode'] is 'WrongOS':
    boxLog.warning('Running as --mode=service currently not supported on {} Operating Systems.'.format(boxOS))

#####
# Module availability check
from pkgutil import find_loader

# module name | extra info
required_modules = {
    'psutil': "If this fails, make sure the python headers are installed, too: 'apt-get install python-dev'",
    'configparser': '',
    'stem': '',
    'bottle': '',
    'apscheduler': ''
}

module_missing = False
for module_name in required_modules:
    if find_loader(module_name) is None:
        boxLog.warning("Required python module '{0}' is missing. You have to install it via 'pip install {0}'."
                       .format(module_name))
        if required_modules[module_name]:
            boxLog.warning(required_modules[module_name])
        module_missing = True

cherrypy_missing = False
if find_loader('cherrypy') is None:
    boxLog.warning("Optional python module 'cherrypy' not found. Cannot use 'CherryPy' as webserver.")
    cherrypy_missing = True

if module_missing:
    boxLog.notice("Hint: You need to have root privileges to operate 'pip'.")
    sys.exit(0)


#####
# General stuff
# import sys
import json                                     # to prepare the LiveData for transmission
from psutil import virtual_memory, cpu_percent  # to readout the cpu load
import uuid                                     # e.g. for authentication
from collections import deque
import functools
import itertools
from threading import RLock
from datetime import datetime, timedelta


#####
# Configuration Management
import configparser     # to read the config file

# Location and name of config files
box_config_path = 'config'
box_config_file = 'theonionbox.cfg'

# Configuration of the connection to the TOR Relay
tor_host = 'localhost'
tor_port = 9090
tor_timeout = -1 # will become 'None' later ...
tor_ttl = 60
tor_ERR = True
tor_WARN = True
tor_NOTICE = True

# Configuration of this server
box_host = 'localhost'
box_port = 8080
box_login_ttl = 30
box_server_to_use = 'default'
box_ntp_server = 'pool.ntp.org'
box_message_level = 'NOTICE'

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
    box_login_ttl = int(box_config.get('login_ttl', box_login_ttl))
    box_ssl = box_config.getboolean('ssl', box_ssl)
    box_ssl_certificate = box_config.get('ssl_certificate', box_ssl_certificate)
    box_ssl_key = box_config.get('ssl_key', box_ssl_key)
    box_ntp_server = box_config.get('ntp_server', box_ntp_server)
    box_message_level = box_config.get('message_level', box_message_level).upper()

if 'TorRelay' in config:
    tor_config = config['TorRelay']
    tor_host = tor_config.get('tor_host', tor_host)
    tor_port = int(tor_config.get('tor_control_port', tor_port))
    tor_timeout = int(tor_config.get('tor_control_timeout', tor_timeout))
    tor_ttl = int(tor_config.get('tor_ttl', tor_ttl))
    tor_ERR = tor_config.getboolean('tor_preserve_ERR', tor_ERR)
    tor_WARN = tor_config.getboolean('tor_preserve_WARN', tor_WARN)
    tor_NOTICE = tor_config.getboolean('tor_preserve_NOTICE', tor_NOTICE)

# TODO: Validate here that we've read reasonable data from the config file
if tor_timeout < 0:
    tor_timeout = None

if box_message_level not in boxLogLevels:

    msg = "Configuration: Wrong parameter '{}' declared for 'message_level'.".format(box_message_level)

    # this check is to prevent ambiguities in case we're in --debug mode (where we do NOT default to 'NOTICE'!)
    if box_cmdline['debug'] is False:
        msg += " Defaulting to 'NOTICE'."

    boxLog.warn(msg)
    box_message_level = 'NOTICE'

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
from tob_time import getTimer
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
# READY to GO!

# give notice that we're alive NOW!
# boxLog.notice("Launching The Onion Box!")


#####
# The Scheduler

# used to run all async activities within TOB
from apscheduler.schedulers.background import BackgroundScheduler
box_cron = BackgroundScheduler()
box_cron.start()

#####
# SESSION Management
from tob_session import SessionFactory, Session, make_short_id

# standard session management
box_sessions = SessionFactory(box_time)
# used for session management during login procedure
box_logins = SessionFactory(box_time, 30)


#####
# Live Data Management
from tob_livedata_manager import LiveDataManager, Cumulator

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
# ... LongTerm Storage
import json

ltd = {}
ltd_file = "theonionbox.ltd"

try:
    with open(ltd_file) as json_file:
        ltd = json.load(json_file)
except Exception as exc:
    boxLog.notice("Failed to load LongTerm Data from file '{}'. Exception raised says '{}'!".format(ltd_file, exc))
    pass
else:
    boxLog.info("Found LongTerm Data file '{}'. Reading data...".format(ltd_file))


# this should be a bit more sophisticated
# if we add further protocol numbers
if 'protocol' not in ltd:
    ltd = {}
elif not ltd['protocol'] == 1:
    ltd = {}

ltd_keys = ['3d', '1w', '1m', '3m', '1y', '5y']

stat = {}
for key in ltd_keys:
    if key in ltd:
        stat[key] = ltd[key]
        boxLog.debug("Found data for key '{}'.".format(key))
    else:
        stat[key] = None

cum3d = Cumulator(900 / 2, initial_status=stat['3d'], max_count=500)
cum1w = Cumulator(3600 / 2, initial_status=stat['1w'], max_count=500)
cum1m = Cumulator(14400 / 2, initial_status=stat['1m'], max_count=500)
cum3m = Cumulator(43200 / 2, initial_status=stat['3m'], max_count=500)
cum1y = Cumulator(172800 / 2, initial_status=stat['1y'], max_count=500)
cum5y = Cumulator(864000 / 2, initial_status=stat['5y'], max_count=500)

cumtors = {'3d': cum3d,
           '1w': cum1w,
           '1m': cum1m,
           '3m': cum3m,
           '1y': cum1y,
           '5y': cum5y}


def save_longterm_data():

    cumtor_status = {'protocol': 1,
                     '3d': cum3d.get_status(),
                     '1w': cum1w.get_status(),
                     '1m': cum1m.get_status(),
                     '3m': cum3m.get_status(),
                     '1y': cum1y.get_status(),
                     '5y': cum5y.get_status()}

    # filename = 'theonionbox.ltd'

    try:
        with open(ltd_file, 'w') as json_file:
            json.dump(cumtor_status, json_file)

        boxLog.info("Longterm Data saved to file '{}'.".format(ltd_file))

    except Exception as exc:
        boxLog.warning("Error while saving Longterm Data to file '{}': ".format(ltd_file, exc))

    return

box_cron.add_job(save_longterm_data, 'interval', minutes=15)

#####
# TOR interface
# import stem
from stem.control import Controller, EventType
from stem.connection import AuthenticationFailure

# The TOR interface
tor = None
tor_password = None
tor_info = {}
tor_info_lock = RLock()


def update_tor_info():

    import stem
    from stem.version import Version
    import platform

    tor_info_lock.acquire()

    if tor and tor.is_alive() and tor.is_authenticated():

        # try:
            tor_info['tor/version'] = tor.get_info('version', '')
            if tor_info['tor/version'] is not '':
                _vers = Version(tor_info['tor/version'])
                tor_info['tor/version/short'] = ("{}.{}.{}.{}").format(_vers.major, _vers.minor, _vers.micro, _vers.patch)
            else:
                tor_info['tor/version/short'] = ''
            tor_info['tor/version/current'] = tor.get_info('status/version/current', 'unknown')
            tor_info['tor/fingerprint'] = tor.get_info('fingerprint', '')
            tor_info['tor/address'] = tor.get_info('address', '')

            tor_info['tor/nickname'] = tor.get_conf('Nickname', '')
            tor_info['tor/orPort'] = tor.get_conf('ORPort', '0')
            tor_info['tor/dirPort'] = tor.get_conf('DirPort', '0')
            tor_info['tor/controlPort'] = tor.get_conf('ControlPort', '0')
            tor_info['tor/controlSocket'] = tor.get_conf('ControlSocket', '')
            tor_info['tor/isAuthPassword'] = tor.get_conf('HashedControlPassword', None) is not None
            tor_info['tor/isAuthCookie'] = tor.get_conf('CookieAuthentication', 0) == "1"

            if tor_info['tor/fingerprint'] is not '':
                _result = None
                tor_info['tor/flags'] = ['none']
                # There's some ugly behaviour in GETINFO("ns/id/...")
                # see https://trac.torproject.org/projects/tor/ticket/7646
                # and https://trac.torproject.org/projects/tor/ticket/7059
                # This behaviour seems to be uncoverable!
                try:
                    _result = tor.get_info("ns/id/{}".format(tor_info['tor/fingerprint']))
                except stem.InvalidArguments as exc:
                    # An exception is created and raised here by stem if the network doesn't know us.
                    # It happens if the network thinks we're not running (which might be obvious)
                    # and as well IF WE'RE IN HIBERNATION (which might not be so obvious)!
                    pass
                else:
                    _result = _result.split('\n')
                    for line in _result:
                        if line.startswith("s "):
                            tor_info['tor/flags'] = line[2:].split()

            tor_info['tor/orListenAddress'] = ""
            _orla = tor.get_conf('ORListenAddress', None)

            if _orla:
                if ":" in _orla:
                    # both ip and port overwritten
                    tor_info['tor/orListenAddress'] = _orla[:_orla.find(":")]
                    tor_info['tor/orPort'] = _orla[_orla.find(":") + 1:]
                else:
                    tor_info['tor/orListenAddress'] = _orla


            _epConf = []
            try:
                _epConf = tor.get_conf("ExitPolicy", [], True)
            except:
                pass

            _epList = []
            if _epConf is not None:
                for _ep in _epConf:
                    _epList += [_pol.strip() for _pol in _ep.split(",")]

            tor_info['tor/exitPolicies'] = _epList

        # except:
            pass

            tor_info['host/system'] = platform.system()
            tor_info['host/name'] = platform.node()
            tor_info['host/release'] = platform.release()
            tor_info['host/version'] = platform.version()
            tor_info['host/machine'] = platform.machine()
            tor_info['host/processor'] = platform.processor()
            tor_info['host/memory'] = virtual_memory().total
            tor_info['host/memory/MB'] = int(virtual_memory().total / (1024 ** 2))

    tor_info_lock.release()

    return

#####
# ONIONOO Protocol Interface
from tob_onionoo import OnionooManager
onionoo = OnionooManager(box_time)


def refresh_onionoo(relaunch_job=False):

    from random import randint
    import time

    boxLog.info('Trying to refresh ONIONOO data.')
    its_now = box_time()
    this_hour = its_now - (its_now % 3600)
    next_run = int(this_hour) + 3600 + randint(0, 3590)

    if 'tor/fingerprint' in tor_info:
        boxLog.debug('Fingerprint for query: {}'.format(tor_info['tor/fingerprint']))
        if onionoo.query(tor_info['tor/fingerprint']):
            boxLog.info('ONIONOO data successfully refreshed')

    else:
        boxLog.info('No Fingerprint to query.')

    run_date = datetime.fromtimestamp(next_run)
    boxLog.info('Next scheduled retry to refresh ONIONOO @ {}'.format(run_date.strftime('%Y-%m-%d %H:%M:%S')))

    if relaunch_job:
        box_cron.add_job(refresh_onionoo, 'date', id='onionoo', run_date=run_date, args=[True])

    return

# to initiate the standard onionoo_refresh cycle (about once an hour)
refresh_onionoo(relaunch_job=True)


#####
# BOTTLE
from bottle import Bottle, run, debug, auth_basic, error, _stderr, _stdout
from bottle import redirect, template, static_file
from bottle import request
from bottle import HTTPError, HTTPResponse
from bottle import WSGIRefServer
import bottle

# set the bottle debug mode
debug(box_debug)

# jQuery version
# jQuery_lib = "jquery-1.11.2.js"
jQuery_lib = "jquery-1.11.2.min.js"

# Bootstrap
# bootstrap_js="bootstrap.js"
bootstrap_js = "bootstrap.min.js"
# bootstrap_css = "bootstrap.css"
bootstrap_css = "bootstrap.min.css"

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
    # check if there is a connection to TOR
    if not tor.is_alive():
        try:
            tor.connect()
        except:
            return False

    global tor_password

    if tor.is_authenticated():
        return password == tor_password
    else:
        try:
            tor.authenticate(password=password)
            tor_password = password
            return True
        except AuthenticationFailure:
            return False


#####
# WebServer implementation starts here

# It would be by far better to use the TOR Standard icon! ;)

theonionbox_icon = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwQAADsEBu" \
                     "JFr7QAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC42/Ixj3wAAAXBJREFUOE+lk7tKA1EQhvcJfAKxFt9ErA" \
                     "TBRmxEbCQIgqKNjZCYygsbtJREjJpFURSNNtEUgRTGSqxDIGgKkxQpx/2GnLNHXJHgwr87Zy7/XM6sJyJe+PAaGP3" \
                     "Y8LAxZDGSHJPdlC+X61dSmAkUyOiwub59oohgYTshhdlAsuO5WGDDJ5YAg3G8Xb6TeqUuvc+eArm4UlRbbuJI5vcW" \
                     "vxNQmslc3a9Kt9mVx+STnE6fSRC2UE6XVfd8WFOf87kLGU6NRgT0ZzLjSCBnF/mpE7WZSna2/IiAIaGkVDIjXydu5" \
                     "P31QwExOmz4IBNjCZg0Svo12QnkC1pvLf3SDj7IxFgCDCgHIUC2BG4Lpc2SypRNILhfe1Ddry1k0geqZEDtRluOJ/" \
                     "N6doGu0+jYIRJjCdxr5KqYNpWYayQzwbXsi/rgq1tpCFiKJX/VZiMLpdIvQHYXCd8fm2hI/lplGxxHACiN/hgS5QN" \
                     "kdLE/0/9+Z/G+AJ9+UUM+BIFlAAAAAElFTkSuQmCC"


# Default Landing Page
@theonionbox.get('/')
def get_start():

    login = box_logins.create(request.remote_addr)

    if login is None:
        raise HTTPError(404)

    login['auth'] = 'digest' if tor_password else 'basic'
    login_template = "pages/login_page.html"

    boxLog.info("{}@{} is knocking for Login; '{}' procedure provided."
                   .format(login.id_short(), login.remote_addr(), login['auth']))

    return template(login_template
                    , session_id=login.id()
                    , bootstrap_css='login.css'
                    , agent=request.get('HTTP_USER_AGENT')
                    , remote_addr=request.get('REMOTE_ADDR')
                    , tor_info=tor_info
                    , icon=theonionbox_icon
                    )


@theonionbox.get('/<login_id>/<login_file:re:login\..*>')
def get_login(login_id, login_file):

    boxLog.debug("{}@{} requests '{}'".format(make_short_id(login_id), request.remote_addr, login_file))
    boxLog.debug("{}: addr = {} / route = {}".format(make_short_id(login_id), request.remote_addr, request.remote_route))

    login = box_logins.recall(login_id, request.remote_addr)

    if login is None:
        raise HTTPError(404)

    # to load the bootstrap css file
    if login_file == 'login.css':
        return static_file(bootstrap_css, root='css', mimetype='text/css')

    # to load the appropriate login script
    elif login_file == 'login.js':
        if 'auth' in login:
            if login['auth'] == 'basic':
                return static_file('authrequest_basic.js', root='scripts', mimetype='text/javascript')
            else:  # e.g. if login['auth'] == 'digest'
                return template('scripts/authrequest_digest.js'
                                , md5_js_file='scripts/md5.js')
        raise HTTPError(404)

    # Used to answer the AuthRequest
    elif login_file == 'login.html':

        try:
            authenticate_login(login, request)
        except HTTPError:
            raise

        # at this stage we have a successful login
        # and switch to standard session management
        session = box_sessions.create(login.remote_addr())
        boxLog.info("{}@{} received session token '{}'; immediate response expected."
                       .format(login.id_short(), login.remote_addr(), session.id_short()))
        box_logins.delete(login.id())

        session['status'] = 'prepared'
        session['prep_time'] = box_time()

        return session.id()

    # if we're here, something definitely went wrong!
    boxLog.warning("{}@{} unauthorized tried to access '{}': Login terminated."
                   .format(login.id_short(), login.remote_addr(), login_file))
    box_logins.delete(login.id())
    raise HTTPError(404)


# This is the standard page!
@theonionbox.get('/<session_id>/index.html')
def get_index(session_id):

    session = box_sessions.recall(session_id, request.remote_addr)

    # this is better than asserting!
    if session is None:
        redirect('/')
        return False    # necessary?

    status = session.get('status', None)

    if status == 'prepared':

        delay = box_time() - session.last_visit
        if delay > 1.0:  # seconds
            boxLog.info('{}@{}: Login to Session delay expired. Session canceled.'
                           .format(session.id_short(), session.remote_addr()))
            box_sessions.delete(session.id())
            redirect('/')
            return False

        session['status'] = 'ok'
        session['guard'] = True

        # we have a successfull connection! Celebrate this!
        boxLog.notice('{}@{}: Session established.'.format(session.id_short(), session.remote_addr()))

    update_tor_info()

    # asyncronously refreshing the onionoo data
    # TODO: This could be tracked (as it happens so regularily!)
    box_cron.add_job(refresh_onionoo, 'date', run_date=datetime.now() + timedelta(seconds=10))

    # dbmanager.prepare(tor_info['tor/fingerprint'], 'theonionbox.data')
#    request_bw_data()

    # setup the MessageHandler for this session
    torLogMgr.add_client(session_id)

    # prepare the preserved events for hardcoded transfer
    p_ev = torLogMgr.get_events(session_id)

    accounting_stats = {}
    try:
        accounting_stats = tor.get_accounting_stats()
        accounting_switch = True
    except:
        accounting_switch = False

    # deliver the main page
    return template("pages/index_page.html"
                    , jquery_lib=jQuery_lib
                    , bootstrap_js=bootstrap_js
                    , bootstrap_css=bootstrap_css
                    , read_bytes=tor_bwdata['download']
                    , written_bytes=tor_bwdata['upload']
                    , version=tor_info['tor/version']
                    , recom=tor_info['tor/version/current']
#                    , version=tor.get_version()
#                    , version = ("{}.{}.{}.{}").format(x_version.major, x_version.minor, x_version.micro, x_version.patch)
                    , fingerprint=tor_info['tor/fingerprint']
                    , address=tor_info['tor/address']
                    , tor_info=tor_info
#                    , strftime_lib=strftime_lib
                    , session_id=session_id
                    , preserved_events=p_ev
                    , server_time=box_time()
                    , accounting_on=accounting_switch
                    , accounting_stats=accounting_stats
#                    , template_directory='template'
                    , icon=theonionbox_icon
                    , box_version=__version__
                    , box_debug = box_debug
                    )


@theonionbox.get('/<session_id>/logout.html')
def get_logout(session_id):

    session = box_sessions.recall_unsafe(session_id)

    if session is not None:
        boxLog.notice('{}@{}: Active LogOut!'.format(session.id_short(), session.remote_addr()))
        box_sessions.delete(session_id)
    else:
        boxLog.warning('LogOut requested from unknown client: {}@{}'.format(make_short_id(session_id), request.remote_addr))

    redirect('/')


@theonionbox.post('/<session_id>/data.html')
def post_data(session_id):

    session = box_sessions.recall(session_id, request.remote_addr)

    # this is better than asserting!
    if session is None:
        raise HTTPError(404)

    guard = session.get('guard', False)
    if guard is False:
        raise HTTPError(503)

    action = request.forms.get('action')
    if action is None:
        raise HTTPError(404)

    # transfer_data = ''

    if action == 'pull_livedata':

        # ensure that the connection to Tor is available
        if tor and not tor.is_alive():
            boxLog.info('Connection to Tor probably lost! Trying to reconnect...')
            try:
                tor.connect()
            except Exception as err:
                boxLog.warning('Attempt to reconnect to Tor failed: {}'.format(err))
            else:
                boxLog.info('Reconnection performed; Tor is alive: {}'.format(tor.is_alive()))

        limit_max = 500  # should be enough to fill the chart immediately
        its_now = int(box_time()) * 1000  # JS!

        pull_full = (request.forms.get('full', '0') == '1')
        if pull_full:
            if 'last_full' in session:
                if (its_now - session['last_full']) < 5000:   # min time between two pull_full requests
                    pull_full = False
        if pull_full:
            session['last_full'] = its_now

        # HD Data: Bandwidth

        if ('last_HD' in session) and not pull_full:
            limit_timestamp = session['last_HD']
            hd_list = tor_livedata.get_data_hd_since(since_timestamp=limit_timestamp)
        else:
            hd_list = tor_livedata.get_data_hd()

        # HD Data: CPU & Memory
        if ('last_CPU' in session) and not pull_full:
            # print(session['last_CPU'])
            limit_timestamp = session['last_CPU']
            host_cpudata_lock.acquire()
            cpu_list = list(itertools.takewhile(lambda x: x['s'] >= limit_timestamp, host_cpudata))
            host_cpudata_lock.release()
        else:
            host_cpudata_lock.acquire()
            cpu_list = list(itertools.islice(host_cpudata, 0, limit_max))
            host_cpudata_lock.release()

        session['last_HD'] = its_now
        session['last_CPU'] = its_now

        # LD Data: Bandwidth
        if ('last_LD' in session) and not pull_full:
            limit_timestamp = session['last_LD']
            ld_list = tor_livedata.get_data_ld_since(since_timestamp=limit_timestamp)
        else:
            ld_list = tor_livedata.get_data_ld()    # dump what you have! ;)

        session['last_LD'] = its_now

        # The Messages from Tor
        runlevel= request.forms.get('runlevel', None)

        if runlevel is not None:

            rl_dict = json.JSONDecoder().decode(runlevel)

            for key in rl_dict:
                torLogMgr.switch(session_id, key, rl_dict[key])

        # The Messages from TheOnionBox
        # runlevel = request.forms.get('box', None)

        # if runlevel is not None:

        #     rl_dict = json.JSONDecoder().decode(runlevel)

        #     for key in rl_dict:
        #         event_switch(session_id, 'BOX|' + key, rl_dict[key])

        # log_list = box_events.get_events(session_id)

        log_list = torLogMgr.get_events(session_id)

        # create the data...
        raw_data_dict = {'tick': its_now, 'hd': hd_list, 'cpu': cpu_list, 'ld': ld_list, 'log': log_list}

        # Onionoo Data
        get_oo = False
        if ('last_oo' in session):
            last_oo = session['last_oo']
            if last_oo < int(onionoo.timestamp()):
                get_oo = True
        else:
            if onionoo.timestamp():
                get_oo = True

        if get_oo:
            # create the data...

            from time import strptime
            from calendar import timegm

            lr = timegm(strptime(onionoo.get_details('last_restarted'), '%Y-%m-%d %H:%M:%S'))

            oo_data = {
                'timestamp': onionoo.timestamp() * 1000,
                'running': onionoo.get_details('running', False),
                'hibernating': onionoo.get_details('hibernating', False),
                'last_restarted': lr * 1000,
                'consensus_weight': onionoo.get_details('consensus_weight'),
                'last_seen': onionoo.get_details('last_seen'),
                'first_seen': onionoo.get_details('first_seen'),
                'advertised_bandwidth': onionoo.get_details('advertised_bandwidth'),
                'bandwidth_rate': onionoo.get_details('bandwidth_rate'),
                'bandwidth_burst': onionoo.get_details('bandwidth_burst'),
                'observed_bandwidth': onionoo.get_details('observed_bandwidth'),
                'cwf': onionoo.get_details('consensus_weight_fraction', 0),
                'gp': onionoo.get_details('guard_probability', 0),
                'mp': onionoo.get_details('middle_probability', 0),
                'ep': onionoo.get_details('exit_probability', 0),

                'bw': onionoo.get_bandwidth(),
                'weights': onionoo.get_weights()
            }

            # print(onionoo.get_weights())

            raw_data_dict['oo'] = oo_data
            session['last_oo'] = int(onionoo.timestamp())

        # updating our long term data information as well
        cumtor_values = {'d3': cum3d.get_values(only_if_changed=True),
                         'w1': cum1w.get_values(only_if_changed=True),
                         'm1': cum1m.get_values(only_if_changed=True),
                         'm3': cum3m.get_values(only_if_changed=True),
                         'y1': cum1y.get_values(only_if_changed=True),
                         'y5': cum5y.get_values(only_if_changed=True)}

        raw_data_dict['ltd'] = cumtor_values

        # Now json everything... and return it!
        transfer_data = json.JSONEncoder().encode(raw_data_dict)
        return transfer_data

    if action == 'refresh_onionoo':

        refresh_onionoo()
        return

        # if onionoo.query(tor_info['tor/fingerprint']):
        #
        #     # create the data...
        #     oo_data = {
        #      'running': onionoo.get_details('running'),
        #      'consensus_weight': onionoo.get_details('consensus_weight'),
        #      'last_seen': onionoo.get_details('last_seen'),
        #      'first_seen': onionoo.get_details('first_seen'),
        #      'bw': onionoo.get_bandwidth()
        #     }
        #
        #     session['last_oo'] = onionoo.timestamp()
        #
        #     # Now json everything... and return it!
        #     transfer_data = json.JSONEncoder().encode(oo_data)
        #     return transfer_data
        #
        # else:
        #     return HTTPError(500)

    return HTTPError(404)

# standard file processing!

@theonionbox.get('/<session_id>/<filename:re:.*\.css>')
def send_css(session_id, filename):

    css_files = [
          bootstrap_css
        ]

    session = box_sessions.recall(session_id, request.remote_addr)
    if session is None:
        raise HTTPError(404)

    guard = session.get('guard', False)
    if guard is True:
        if filename in css_files:
            return static_file(filename, root='css', mimetype='text/css')

    raise HTTPError(404)


@theonionbox.get('/<session_id>/<filename:re:.*\.js>')
def send_js(session_id, filename):

    js_files = [
          'authrequest_basic.js'
        , 'authrequest_digest.js'
        , bootstrap_js
        , 'box_chart.js'
        , 'box_messages.js'
        , 'box_player.js'
        , jQuery_lib
        , 'smoothie.js'
        ]

    session = box_sessions.recall(session_id, request.remote_addr)
    if session is None:
        raise HTTPError(404)

    guard = session.get('guard', False)
    if guard is True:
        if filename in js_files:
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

    # Filling the LongTerm Storage

    for key, cumtor in cumtors.items():
        cumtor.cumulate(timestamp=event.arrived_at,
                        r=event.read, w=event.written)

#        if box_debug:
#            if key == '3d':
#                print(cumtor.get_status())

    return True


def record_cpu_data(timestamp=None, compensate_deviation=True):

    if timestamp is None:
        timestamp = time()

    if compensate_deviation is True:
        timestamp = box_time(timestamp)

    timestamp *= 1000   # has to be converted to ms as JS expects ms!

    # we always catch the current cpu load
    cpu = {}
    count = 0

    # notice: psutil.cpu_percent() will return a meaningless 0.0 when called for the first time
    # this is not nice yet doesn't hurt!
    for cx in cpu_percent(None, True):
        cpu['c%s' % count] = cx
        count += 1

    cpu['s'] = timestamp

    # ... and the percentage of memory usage
    cpu['mp'] = virtual_memory().percent

    # append the data to the list
    host_cpudata_lock.acquire()

    host_cpudata.appendleft(cpu)

    host_cpudata_lock.release()


def request_bw_data():

    # we use this method to align the counters
    try:
        req_info = ("traffic/read", "traffic/written")
        req_answer = tor.get_info(req_info)

        tor_bwdata['upload'] = int(req_answer["traffic/written"])
        tor_bwdata['download'] = int(req_answer["traffic/read"])

        tor_livedata.init_total_basis(bytes_read=tor_bwdata['download']
                                      , bytes_written=tor_bwdata['upload'])

    except:
        pass

    return


#####
# Custom Server Adapters to allow shutdown() of the servers
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


# Patching the bottlepy - supported servers:
# The concept of these patches was provided by 'blais' given on
# http://stackoverflow.com/questions/11282218/bottle-web-framework-how-to-stop
# Great idea!
# That's how the code for a patched WSGIRefServer looks like!
# We don't use it, yet keep it here for backup in case we want to support further servers.
#
# 20151226: patched CheeryPy below!

# Patched WSGIRefServer
# class box_WSGIRefServer(WSGIRefServer, ShutDownAdapter):
#
#     server = None
#
#     def __init__(self, host='127.0.0.1', port=8080, **options):
#         WSGIRefServer.__init__(self, host, port, **options)
#
#         # Save the original function.
#         from wsgiref.simple_server import make_server
#
#         # Create a decorator that will save the server upon start.
#         def custom_make_server(*args, **kw):
#             self.server = make_server(*args, **kw)
#             return self.server
#
#         # Patch up wsgiref itself with the decorated function.
#         import wsgiref.simple_server
#         wsgiref.simple_server.make_server = custom_make_server
#
#     def shutdown(self):
#         print("shutting down!")
#         self.server.shutdown()


# Our WSGIRefServer - supporting SSL!
class BoxWSGIRefServer(WSGIRefServer, ShutDownAdapter):

    # This one incorporates a proposal from Matt Murfitt, posted on
    # http://www.socouldanyone.com/2014_01_01_archive.html or
    # https://github.com/mfm24/miscpython/blob/master/bottle_ssl.py

    # Trying SSL with bottle
    # ie combo of http://www.piware.de/2011/01/creating-an-https-server-in-python/
    # and http://dgtool.blogspot.com/2011/12/ssl-encryption-in-python-bottle.html
    # without cherrypy?
    # requires ssl

    # to create a server certificate, run eg
    # openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
    # DON'T distribute this combined private/public key to clients!
    # (see http://www.piware.de/2011/01/creating-an-https-server-in-python/#comment-11380)
    # from bottle import Bottle, get, run, ServerAdapter

    def run(self, app): # pragma: no cover

        # Majority of code copy/paste from bottlepy!

        from wsgiref.simple_server import WSGIRequestHandler, WSGIServer
        from wsgiref.simple_server import make_server
        import socket
        import ssl

        # we've 'misused' **options to transfer the certfile info
        # ... so rearrange things again to ensure that the rest on the code works!
        certfile = self.options.get('certificate')
        if certfile:
            del self.options['certificate']

        class FixedHandler(WSGIRequestHandler):
            def address_string(self): # Prevent reverse DNS lookups please.
                return self.client_address[0]

            def log_request(*args, **kw):
                if not self.quiet:
                    return WSGIRequestHandler.log_request(*args, **kw)

        handler_cls = self.options.get('handler_class', FixedHandler)
        server_cls = self.options.get('server_class', WSGIServer)

        if ':' in self.host: # Fix wsgiref for IPv6 addresses.
            if getattr(server_cls, 'address_family') == socket.AF_INET:
                class server_cls(server_cls):
                    address_family = socket.AF_INET6

        srv = make_server(self.host, self.port, app, server_cls, handler_cls)

        if certfile:
            srv.socket = ssl.wrap_socket(srv.socket,
                                         certfile=certfile,  # path to certificate
                                         server_side=True)

        self.server = srv
        srv.serve_forever()

    def shutdown(self):
        boxLog.notice("Shutting Server down!!")
        self.server._BaseServer__shutdown_request = True
        self.server._BaseServer__is_shut_down.wait(2)

        # self.server.shutdown()
        boxLog.notice("Shutdown Server done!!")


# We're using a slightly modified CherryPy - Server implementation
# to make it a bit more robust. Original code copy / paste from bottlepy;
# therefore no need to hugely patch the code
class BoxCherryPyServer(ServerAdapter, ShutDownAdapter):

    def run(self, handler): # pragma: no cover
        from cherrypy import wsgiserver
        self.options['bind_addr'] = (self.host, self.port)
        self.options['wsgi_app'] = handler

        certfile = self.options.get('certfile')
        # if certfile: <-- bottle.py code
        if certfile is not None:
            del self.options['certfile']
        keyfile = self.options.get('keyfile')
        # if keyfile: <-- bottle.py code
        if keyfile is not None:
            del self.options['keyfile']

        server = wsgiserver.CherryPyWSGIServer(**self.options)
        if certfile:
            server.ssl_certificate = certfile
        if keyfile:
            server.ssl_private_key = keyfile

        # preparation for shutdown()
        self.server = server

        try:
            server.start()
        finally:
            server.stop()

    def shutdown(self):
        self.server.stop()


# This job runs at midnight to add a notification to the log
# showing the current day
def job_NewDayNotification():

    timestamp = box_time()
    boxLog.notice("----- Today is {}. -----".format(datetime.fromtimestamp(timestamp).strftime('%A, %Y-%m-%d')))
    return

box_cron.add_job(job_NewDayNotification, 'cron', id='ndn', hour='0', minute='0', second='0')



# from time import strftime
from threading import Timer

# timer_housekeeping = Timer(10, session_housekeeping)
# timer_housekeeping.start()
timer_housekeeping = None
housekeeping_interval = 5  # seconds

# NTP time is used to compensate for server clock adjustments
box_cron.add_job(update_time_deviation, 'interval', hours=8)


bw_countdown = 100


def session_housekeeping():

    # We perform HERE things that have to happen regularly

    # 1: aligning the bandwidth counters
    global bw_countdown
    if bw_countdown < 0:

        # request_bw_data()
        bw_countdown = 100

    else:
        bw_countdown -= 1

    # 2.1: clear expired logins
    if box_logins:
        while True:
            expired_login_id = box_logins.check_for_expired_session(remove_expired_session=False)

            if expired_login_id is None:
                break

            login = box_logins.recall_unsafe(expired_login_id)
            if login is not None:
                boxLog.info('{}@{}: Login request expired.'.format(login.id_short(), login.remote_addr()))
            box_logins.delete(expired_login_id)

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
            torLogMgr.remove_client(expired_session_id)

    # 3: check if there's the need to remove_event_listeners (when there's no client asking for these events)
    # for key in tor_event_handlers:
    #     if box_events.get_active_clients(key) == 0:
    #         try:
    #             tor.remove_event_listener((tor_event_handlers[key]))
    #         except:
    #             return

    global tor_password

    # 4: closing connection to tor
    # if this is requested
    if tor.is_authenticated() and tor_ttl > 0:   # <==0 => don't ever close the connection!

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

    # 20150629/RDW: removed ... nit sure if really necessary anymore!
    # else:
    #     # ensure that we have an open connection
    #     if tor_password is not None:
    #         check('TRB', tor_password)

    # # 5: request the time from an NTP server to compensate the server clock
    # global ntp_countdown
    #
    # if ntp_countdown < 0:
    #
    #     update_time_deviation()
    #     ntp_countdown = 1000
    #
    # else:
    #     ntp_countdown -= 1

    # 6: update tor_info
    if tor.is_authenticated():
        update_tor_info()

    # finally: prepare and launch the next run...
    timer_housekeeping = Timer(housekeeping_interval, session_housekeeping)
    timer_housekeeping.start()


#####
# Keyboard Interrupt Handler
import signal


def sigint_handler(signal, frame):
    exit_procedure(False)
    sys.exit()


def exit_procedure(quit=True):

    # We're NOT saving the LTD here to prevent corruption of the file.
    # TODO: Introduce a smarter algorithm to handle the loading / (especially) saving of the LTD file!
    # Until this is available, we accept to loose some minutes of date!

    # save_longterm_data()

    if timer_housekeeping:
        timer_housekeeping.cancel()

    if box_cron:
        box_cron.shutdown()

#    if dbmanager:
#        dbmanager.close()

    try:
        if tob_server:
            tob_server.shutdown()
    except:
        pass

    # RDW 20151224: Still valid?
    # TODO: python sometimes emits a 'ResourceWarning' when we are here! This does not hurt ... but it's ugly!
    # TODO: Try to find a fix for this!

    print("Shutting Down!")

    if quit:
        sys.exit(0)


# patching the stem classes to control the timeout values!
from stem.socket import ControlPort
from stem import SocketError, util
import socket


class BoxControlPort(ControlPort):

    timeout = None
    control_socket = None

    def __init__(self, address='127.0.0.1', port=9051, connect=True, timeout=None):

        self.timeout = timeout
        ControlPort.__init__(self, address, port, connect)

    # this is basically stem.socket.ControlPort._make_socket adapted to set a custom timeout value
    def _make_socket(self):

        if self.control_socket:
            self.close_socket()

        try:
            self.control_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        except socket.error as exc:
            raise SocketError(exc)

        try:
            # timeout management
            if self.timeout:
                self.control_socket.settimeout(self.timeout)
                pass

            self.control_socket.connect((self._control_addr, self._control_port))
            return self.control_socket
        except socket.error as exc:

            # to compensate for a ResourceWarning 'unclosed socket'
            self.close_socket()
            raise SocketError(exc)

    def close_socket(self):
        if self.control_socket:
            self.control_socket.close()
            self.control_socket = None


class BoxController(Controller):

    @staticmethod
    def from_port_timeout(address='127.0.0.1', port=9051, timeout=None):

        # this one is basically stem.Controller.from_port patched
        # to forward a timeout value to BoxControlPort

        if not util.connection.is_valid_ipv4_address(address):
            raise ValueError('Invalid IP address: %s' % address)
        elif not util.connection.is_valid_port(port):
            raise ValueError('Invalid port: %s' % port)

        # timeout management
        if timeout and timeout < 0:
            timeout = None

        control_port = BoxControlPort(address=address, port=port, timeout=timeout)
        return BoxController(control_port)


if __name__ == '__main__':

    boxLog.notice('Trying to connect to Tor Relay on {}:{}.'.format(tor_host, tor_port))
    try:
        if tor_timeout:
            boxLog.notice('Timeout set to {}s.'.format(tor_timeout))
            tor = BoxController.from_port_timeout(tor_host, tor_port, tor_timeout)
        else:
            tor = Controller.from_port(tor_host, tor_port)
    except SocketError as err:
        boxLog.warning('Failed to connect; exiting...')

        # TODO: When this error occurs, there's still a socket error raised! Fix it!
        exit_procedure()
        # just to be sure .. ;)
        sys.exit(0)

    if not tor.is_alive():
        sys.exit(0)

    boxLog.notice('Connected...')

    update_time_deviation()

    # now we can establish the Handlers for Tor's messages
    torLogMgr = LoggingManager(tor, notice=tor_NOTICE, warn=tor_WARN, err=tor_ERR)
    # and enable the Forwarder
    boxFwrd.setTarget(torLog)

    # start the to be persisted events
    # if tor_ERR is True:
    #     tor.add_event_listener(tor_ERR_event_handler, EventType.ERR)
    #
    # if tor_WARN is True:
    #     tor.add_event_listener(tor_WARN_event_handler, EventType.WARN)
    #
    # if tor_NOTICE is True:
    #     tor.add_event_listener(tor_NOTICE_event_handler, EventType.NOTICE)

    # start the event handler for the Bandwidth data
    tor.add_event_listener(functools.partial(handle_livedata), EventType.BW)

    # we're able to use several servers ... if available on the host system
    # Currently implemented:
    # CherryPy
    # WSGIRefServer (fallback!)

    tob_server = None

    if box_server_to_use == 'cherrypy' and not cherrypy_missing:

        if box_ssl is True:
            tob_server_options = {'certfile': box_ssl_certificate, 'keyfile': box_ssl_key}
            tob_server = BoxCherryPyServer(host=box_host
                                            , port=box_port
                                            , **tob_server_options)

            boxLog.notice('Operating with CherryPy in SSL Mode!')
        else:
            tob_server = BoxCherryPyServer(host=box_host, port=box_port)
            boxLog.notice('Operating with CherryPy!')
    else:
        # Be aware that WSGIRefServer has issues with IE, in the sense that *it doesnt work!!*
        if box_ssl is True:
            # SSL enabled
            tob_server = BoxWSGIRefServer(host=box_host, port=box_port, certificate=box_ssl_certificate)
            boxLog.notice("Operating with WSGIRefServer in SSL mode!")
        else:
            # Standard
            tob_server_options = {'handler_class': box_FixedDebugHandler}
            tob_server = BoxWSGIRefServer(host=box_host, port=box_port, **tob_server_options)
            # tob_server = WSGIRefServer(host=box_host, port=box_port)
            boxLog.notice('Operating with the default WebServer!')
        boxLog.warning("A single IE request can stall this server and thus the BOX!")

    # register Keyboard Interrupt handler
    # for sig in (signal.SIGINT, signal.SIGABRT, signal.SIGTERM):
    # signal.signal(sig, sigint_handler)
    # signal.signal(signal.SIGINT, sigint_handler)

    # if we're here ... almost everything is setup and running
    # good time to launch the housekeeping for the first time!
    session_housekeeping()

    boxLog.notice('Ready to listen on http://{}:{}/'.format(tob_server.host, tob_server.port))

    try:
        if box_debug is True:
            run(theonionbox, server=tob_server, host=box_host, port=box_port)
        else:
            run(theonionbox, server=tob_server, host=box_host, port=box_port, quiet=True)
    except Exception as exc:
        # print(exc)
        pass
    finally:
        exit_procedure(False)
        print("Almost Done!")
        # sys.exit(0)

        # while True:
        #     signal.pause()
