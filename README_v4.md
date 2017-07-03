# Draft
Please be advised that this documentation covers _The Onion Box_ v4.0 which hasn't been released so far.

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

---

### Header
The Header of the page displays some basic information about the Tor node monitored.

![image](docs/images/header.png)

If you connected to this node via password authentication, you'll find a Logout Button in the upper right corner.

If your Box discovers that there is an update of it's code available, a button in the upper left corner is displayed, providing access to some further information - and a link to GitHub.

---

### Host | General Information
The section _Host | General Information_ displays information regarding the host system.

![image](docs/images/generalinfo.png)

This section is only available if the Box is running at the same physical device as the Tor node monitored.

_Latest Reboot_ as well as _Temperature_ are only available on supported operating systems.

If the host provides several CPU cores, you may click on the _CPU Usage_ chart to get a popup window displaying a seperate usage chart for each core.

---

### Tor | Configuration
The section _Tor | Configuration_ displays the configuration parameters of the Tor node monitored:

![image](docs/images/configuration.png)

_Commandline_ lists the command line parameters used when launching the Tor node.

_Configuration Files_: A Tor node is configured by several sets of parameters. Those are Tor internal default settings, default settings defined in a configuration file referenced as _torrc.default_ (usually given by the Tor developers), user defined parameters (usually in a configuration file referenced as _torrc_) and finally parameters defined via the command line. The path to the two configuration files is indicated here.

The rest of this section displays all parameters that differ from the Tor internal default settings - except Hidden Service configuration settings (which are displayed in their own section).

If the curser hovers over the name of a configuration parameter, a hashtag is displayed providing a link to the Tor documentation. On mobile devices, you have to click on the name to make the hashtag appear.

There are some parameters that can be defined (e.g. via the command line), despite Tor doesn't report that those are set. The following table lists those parameters:

|
|---|
| __OwningControllerProcess |

---

### Hidden Services | Configuration
The section _Hidden Services | Configuration_ displays the configuration parameters for the hidden service(s) of the Tor node monitored:

![image](docs/images/hidden.png)

This section is only available if at least one hidden service is configured on this Tor node.
 ---

### Tor | Local Status
The section _Tor | Local Status_ displays information that the Tor node monitored knows about itself and its hosting environment.

![image](docs/images/local.png)

 ---

### Tor | Network Status
The section _Tor | Network Status_ displays information provided by [Onionoo](http://onionoo.torproject.org), the Tor network status protocol, concerning the Tor node monitored.

![image](docs/images/network.png)

Those information are fetched regularly from Onionoo. If not available (which could happen when you connect to a node for the first time or when operating via slow connections), you will be asked to reload the page.

Only parts of this section are available if the Tor node monitored is operated as a bridge.

_Location_ by default provides the information Onionoo knows about the location of the Tor node & shows the location on a map.

![image](docs/images/location.png)

By special configuration you can advise the Box to query the location of the IP address of the Tor node monitored from a user provided GeoIP City DB.

_Bandwidth_ displays the bandwidth history data as known to Onionoo.

![image](docs/images/bandwidth.png)

The number of available charts depends on the age of the Tor node monitored. You may switch the chart displayed via the _History Charts_ buttons.

_Weights_ displays the weights history data as known to Onionoo.

![image](docs/images/weights.png)

The number of available charts depends on the age of the Tor node monitored. You may switch the chart displayed via the _History Charts_ buttons.

---

### Tor | Control Center
Do you intend to monitor more than one Tor node?  
Are you interested in the Oninooo data of other Tor nodes?  
The section _Tor | Control Center_ provides that functionality.

![image](docs/images/control.png)

If you provided access control information for additional Tor nodes in the configuration file of your Box, those nodes are listed under _Controlled Hosts_. Click on the fingerprint and you will be connected to that Tor node.

Enter a search phrase - which should be a (part of a) nickname of a Tor node or a (portion of a) fingerprint - into the _Search_ field and press enter. This search phrase will be used to query Onionoo - and the result presented in a popup bubble. If the search was successful, you may click on the links provided to display the Tor network status protocol data of that Tor node.

---
### Tor | Messages
The section _Tor | Message_ displays the messages received from the Tor node(s) monitored and from your Box.

![image](docs/images/messages.png)

You can alter the noisiness of the Tor node monitored by mean of the _Level_ selector buttons. Be advised that it takes some seconds to forward a message level change to the node.
> By default, _INFO_ and _DEBUG_ level messages are not forwarded to the monitoring application. _INFO_ is babblative - and _DEBUG_ even more. Both levels create a lot of traffic. Use those settings with caution!

This section is only available for controlled nodes.

> The message system of _The Onion Box_ cannot be manipulated via the web interface. If you are interested in receiving _DEBUG_ or _TRACE_ message from your Box, you have to set the appropriate command line parameter.

## Configuration

By design, _The Onion Box_ is able to detect a typical local Tor node installation and will connect without further configuration. Above that, you may configure the way of operation of your Box via a configuration file.

### Configuration file location
If you do not provide a dedicated `path_to_the_configuration_file` via the command line, _The Onion Box_ checks for availability of a file named `theonionbox.cfg` at one of the following locations:
* in the same directory as `theonionbox.py`: `./theonionbox.cfg`
* in a directory named `config` below the directory of `theonionbox.py`: `./config/theonionbox.cfg`

### Configuration file structure
The configuration file of _The Onion Box_ is a simple text file "ini-style" with some mandatory and some optional sections. A template of that file is available as `./config/theonionbox.example`.

#### Section `[config]`
```
[config]
## v4.0 will only support version = 2
protocol = 2
```
_The Onion Box_ as of version 4 only supports configuration file protocol `2`.

#### Section `[TheOnionBox]`
```
[TheOnionBox]
## Address of your Onion Box:
## This defaults to 0.0.0.0 to listen on all interfaces.
# host = 0.0.0.0
## If 'localhost', connections are limited to the local system.
# host = localhost
## Of course you may define a dedicated IP4 address as well.
# host = your.IP.4.address

## Port for the Web Server
## Defaults to 8080, which should be fine in most cases!
# port = 8080

## To define the lower threshold for the notification system:
## Messages (of the Box) with at least this level will be forwarded to the attached clients.
## Possible setting are DEBUG, INFO, NOTICE, WARNING, ERROR
## Defaults to NOTICE, case insensitive
## To 'DEBUG' or 'TRACE' the box you have to set the respective commandline parameters!
# message_level = NOTICE

## Per default, the Box operates at the root level of a domain e.g. http://localhost:8080/.
## If you intend to operate it (behind a proxy!) at a deeper level (e.g. @ http://my.server.com/theonionbox/)
## you have to define that base path here. You are not limited to a single path element.
## Please assure that this is an absolute filepath yet without the domain:port, beginning with a leading slash,
## no trailing slash, no quotation marks:
# base_path = /theonionbox

## The acceptable duration in seconds between two communication events of a client to the Box.
## If this duration is exceeded, the Box will expire the session. Default is 300 (seconds).
# session_ttl = 300
## Note: This is applicable for login procedures as well as monitoring activities.
## Note: The minimum duration accepted == 30, max == 3600. Values will be forced into that range.

## Shall we operate with SSL?
## Note: To actually make this running, you have to create a valid ssl certificate first:
## So run e.g.
## openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
##
## DON'T distribute this combined private/public key to clients!
## (see http://www.piware.de/2011/01/creating-an-https-server-in-python/#comment-11380)
##
## ssl = yes    # deprecated 20170218
## Just set ssl_certificate & ssl_key to enable ssl mode!
## The file that holds the Certificate!
# ssl_certificate = server.pem
## The file that holds the Key!
# ssl_key = private_key.pem

## When a NTP server is provided
## we use it's time signal to compensate for the server's clock deviations
# ntp_server = pool.ntp.org
# ntp_server = fritz.box

## Tor ships with the GeoIPLight2 Country DB
## If you're interested in a more precise indication, you should install the GeoIP City DB
## e.g. from http://dev.maxmind.com/geoip/geoip2/geolite2/ and define here the path to the db file.
## Both flavours (Full or Light) are supported.
# geoip2_city = path/to/geoip2/city/db.mmdb
## Be aware that you need to install python module 'geoip2' as well to access those information.
```

#### Section `[Tor]`

```
[Tor]
## How shall we establish the connection to your primary (controlled) Tor node?
## => via a ControlSocket (define additionally 'socket' parameter):
# control = socket
## => via a ControlPort (define additionally 'host' & 'port' parameter):
# control = port
## => via a Proxy (define a proxy via the [Proxy] section and set 'host' to an address reachable through this proxy):
# control = proxy
## Note: This defaults to control = port if not defined!

## Address of this Tor instance
## Do NOT use 'localhost' but 127.0.0.1 to connect locally
## Defaults to 127.0.0.1
# host = 127.0.0.1

## ControlPort of this Tor instance
## Default for a Relay (or Bridge)
# port = 9051
## Default for a TorBrowser
# port = 9151
## You may use 'default' (port = default) to test for 9051 (relay default) and 9151 (browser default)
# port = default
## Note: This defaults to port = default if not defined!

## ControlSocket of this Tor instance
# socket = /var/run/tor/control

## Timeout when connecting to Tor.
## Usually the connection should be established very quick;
## you may increase this if connecting to very remote systems.
# timeout = 5

## The Number of Seconds we keep the connection to
## Tor open after the last user disconnected.
## Hint: The minimum reasonable TTL is > 30(s)
## Defaults to 30 (seconds)
## eg. 1 day
# ttl = 86400
## eg. 1 hour
# ttl = 3600
## eg. forever
# ttl = -1

## Switches to preserve the messages of the Relay
## Up to 400 messages (total) will be preserved
## The severity of these messages can be defined here
## There's one switch for ERR, WARN & NOTICE
## The default setting is 'on' for all of these
## There's NO switch for INFO & DEBUG (as this would flood the memory without true value)
## Live - transmission of messages can be switched on/off in the client
# tor_preserve_ERR = no
# tor_preserve_WARN = no
# tor_preserve_NOTICE = no

## Port of the proxy to use.
## Default for a Relay (or Bridge)
# port = 9050
## Default for a Tor Browser
# port = 9150
## You may use 'default' (port = default) to test for 9050 (relay default) and 9150 (browser default)
# port = default
## Note: This defaults to port = default if not defined!
## Note: The address of the proxy is defined by the 'host' config option.
## Note: Operation via a proxy given by a unix domain socket is (as of 04/2017) not supported!
```

#### Section `[TorProxy]`
```
[TorProxy]
## Note: Operation via a proxy given by a unix domain socket is (as of 04/2017) not supported!

## If you establish connection cookies for hosts to be controlled via the control center, there is the need
## to verify that those cookies are defined. To perform the verification, we need valid control port
## settings of the node acting as proxy:
## How shall we establish the connection to the node?
## => via a ControlSocket (define additionally 'socket' parameter):
# control = socket
## => via a ControlPort (define additionally 'port' parameter):
# control = port
## You may use control = default to operate with [TorRelay]control
## Note: This defaults to control = default if not defined!

## Address of the proxy to use
## Do NOT use 'localhost' but 127.0.0.1 to connect locally
## You may use 'default' (host = default) to use [TorRelay]host
# host = default
# host = 127.0.0.1
## Note: This defaults to host = default if not defined!

## Port for the proxy
## Default for a Relay (or Bridge)
# proxy = 9050
## Default for a Tor Browser
# proxy = 9150
## You may use 'default' (proxy = default) to test for 9050 (relay default) and 9150 (browser default)
# proxy = default
## Note: This defaults to proxy = default if not defined!

## ControlPort of the proxy Tor node
## Default for a Relay (or Bridge)
# port = 9051
## Default for a Tor Browser
# port = 9151
## You may use 'default' (port = default) to test for 9050 (relay default) and 9150 (browser default)
# port = default
## Note: This defaults to port = default if not defined!

## ControlSocket of the proxy Tor node
# socket = /var/run/tor/control
## You may use 'default' (socket = default) to use [TorRelay]socket
# socket = default
## Note: This defaults to socket = default if not defined!
```

#### Controlled Hosts
For each Tor node you intend to monitor - in addition to the "primary" node configured in section `[Tor]` - you have to add a dedicated section proving the access data for its `ControlPort`.

```
#####
## Those are the Tor nodes to be controlled with the control center
## Note: You must not name any of the following sections 'config', 'TheOnionBox', 'Tor' or 'TorProxy'.


## Define one section per node:
# [myControlledNode]

## Alternatively: Beginning the section identifier with '#' indicates a nickname;
## if you later omit the 'nick' parameter, the nickname will be derived from the section identifier.
# [#myControlledNode]
## If you intend to define several ways to connect to this node,
## add whatever you like after a ':' to distinguish the sections:
# [#myControlledNode:2]

## Alternatively: You can use the fingerprint (with preceding '$') as section identifier.
## Ensure a length of 41 characters: '$' + fingerprint[40];
## if you later omit the 'fp' parameter, the fingerprint will be derived from the section identifier.
# [$5COOL5C30AXX4B3DE460815323967087ZZ53D947]
## If you intend to define several ways to connect to this node,
## add whatever you like after a ':' to distinguish the sections:
# [$5COOL5C30AXX4B3DE460815323967087ZZ53D947:2]


## How shall we establish the connection to this node?
## => via a ControlSocket (define additionally 'socket' parameter):
# control = socket
## => via a ControlPort (define additionally 'host' & 'port' parameter):
# control = port
## => via a Proxy (define a proxy via the [Proxy] section and set 'host' to an address reachable through this proxy):
# control = proxy
## Note: There is no default setting. If not defined, this section (and thus the node) will be ignored.

## IP Address of this Tor node
# host = 127.0.0.1
## You may as well define an onion or http address
# host = takeonionaddress.onion
## Note: There is no default setting.

## ControlPort of this Tor node
## Default for a Relay (or Bridge)
# port = 9051
## Note: There is no default setting.

## This is only relevant for very rare setups - yet if you like, you may use it!
## ControlSocket of this Tor node
# socket = /var/run/tor/control
## Note: There is no default setting.

## Hidden Service connections my be secured by definition of a authorization cookie.
## To operate via those connections, you may define this cookie here.
## For further details refer to 'HiddenServiceAuthorizeClient' on https://www.torproject.org/docs/tor-manual.html
# cookie = xuseyourcookieherexTOB
## The Box will ensure that the cookie is registered before establishing the connection.
## Note: There is no default setting.

## The nickname of this node
# nick = myControlledNode
## Defining a nickname here overrides a nickname defined as the name of the section.
## Note: The Box is able to retrieve the nickname itself,
##       yet defining nickname (and fingerprint) parameters saves onionoo queries.
## Note: There is no default setting.

## The fingerprint of this node
# fp = $5COOL5C30AXX4B3DE460815323967087ZZ53D947
## Defining a fingerprint here overrides a fingerprint defined as the name of the section.
## Note: The Box is able to retrieve the fingerprint itself,
##       yet defining fingerprint (and nickname) parameters saves onionoo queries.
## Note: There is no default setting.
```

## Command line parameters

## Advanced Operation
This chapter explains how to configure or set up _The Onion Box_ for dedicated use cases.
