# The Onion Box
_The Onion Box_ provides a web interface to monitor the operation of
a [Tor](https://www.torproject.org) node. It is able to monitor any Tor node operated as relay, as bridge and even as client - as long as it can establish a connection to the node and authenticate successfully.

The connection to the Tor node to be monitored may be established via a local `ControlSocket` or a `ControlPort` (local or remote). Advanced users may establish a connection via the Tor network to a node proving access to it's `ControlPort` by means of a Hidden Service - supporting on demand as well [Hidden Service Client Authorization](https://www.torproject.org/docs/tor-manual.html.en#HiddenServiceAuthorizeClient).

_The Onion Box_ supports whatever authentication method the Tor node provides.

A single instance of _The Onion Box_ is able to provide monitoring functionality for as many nodes as you like.

Above that, _The Onion Box_ is able to display Tor network status protocol data for any Tor node known by [Onionoo](http://onionoo.torproject.org).


## Supported environment
_The Onion Box_ is a Python application, developed with v2.7.13 and v3.6.0.

By default, it should operate successfully on every platform providing Python support. Confirmation can be given that it works properly in following environments:
- Debian | Jessie
- FreeBSD
- macOS | Darwin
- Raspbian | Jessie
- Windows 10

## Installation
Usually the Box is installed on the same system that hosts the Tor node it shall monitor.

>Technically yet this isn't mandatory. The Box just needs to know how to access the ControlPort or ControlSocket of a Tor node.

>The Advanced Operation section below explains how to configure The Box to operate in different specialized environments.

_The Onion Box_ depends on some additional libraries, so make sure they are
installed:

* [psutil](https://pypi.python.org/pypi/psutil)
* [stem](https://pypi.python.org/pypi/stem)
* [bottle](https://pypi.python.org/pypi/bottle)
* [APScheduler](https://pypi.python.org/pypi/apscheduler)
* [PySocks](https://pypi.python.org/pypi/PySocks)

If you intend to use the advanced GeoIP2 functionality, you have to install as well the module [geoip2](https://pypi.python.org/pypi/geoip2).

If you intend to operate The Box in SSL mode, you have to install as well the module [ssl](https://pypi.python.org/pypi/ssl).


Those modules are usually installed using pip, e.g.:

```
pip install psutil
```

Please use always the latest version available for your Python release. Remember that you (usually) need to have root privileges to operate pip, e.g.: sudo -u pip install psutil`.

## Basic Operation
The Box of course provides numerous setting to customize its operational behaviours. Yet it as well has great default settings and is able to detect the usual Tor setups without further configuration. Therefore, if you are operating your node at `ControlPort 9051` (which is the default for a relay) or `ControlPort 9151` (the default for TorBrowser) just open a console, change to the directory where you installed your Box and launch it:
```
sudo -u debian-tor python theonionbox.py
```
On Windows, it's usually enough to use
```
python theonionbox.py
```

Your Box will perform some steps to initialize and then wait for connections at `http://127.0.0.1:8080`. A typical startup sequence looks like

```
19:23:26.590 The Onion Box: WebInterface to monitor your Tor operations.
19:23:26.606 Version v4.0 (stamp 2017mmdd|hhmmss)
19:23:26.700 Operating with configuration from 'config/theonionbox.cfg'
19:23:27.381 Temperature sensor information located in file system. Expect to get a chart!
19:23:27.383 Uptime information located. Expect to get a readout!
19:23:28.010 Ready to listen on http://127.0.0.1:8080/
```

At that stage, just open your favourite web browser and connect to your Box. Enjoy monitoring!

## The Web Interface
The web interface of _The Onion Box_ consists of a number of sections. If a section is displayed and how the section looks like, depends on the data your Box received from the Tor node monitored or knows about it from the Tor network status protocol. The web interface is generated on demand based on the latest data available.

> Tip: If a dedicated section is not displayed, just reload the page. Press `F5` or `command + R` to re-run the page creation process.

If you want to see _The Onion Box_ in action, just connect to myOnionBox (the system set up for the development activities). Be aware that this is an onion link providing access a Tor Hidden Service. You need [TorBrowser](https://www.torproject.org/projects/torbrowser.html.en) or a similar tool to follow this link.

### Header
The Header of the page displays some basic information about the monitored Tor node.

If you connected to this node via password authentication, you'll find a Logout Button in the upper right corner.

If your Box discovers that there is an update of it's code available, a button in the upper left corner is displayed, providing access to some further information - and a link to this version at GitHub.

![image](docs/images/header.png)
