# The Onion Box
Web based Status Monitor for [Tor Relays](http://www.torproject.org)

**The Onion Box** provides a web interface to connect to a Tor relay
and monitor aspects of it's operation in "real time". That's how it looks like
in action:

![image](https://cloud.githubusercontent.com/assets/16342003/12043105/c8f17f18-ae81-11e5-8b21-c7ecf80b37f9.png)

You will get information concerning the host system (like cpu load or memory usage), your current Tor configuration and 
a plentitude of data from the Onionoo Network (including a nice map showing the locality of your server based on
the distributed GeoIP data). In addition, the page displays your relay's upload / download performance
using real time charts and allows to switch Tor's event system.

| NEW in v2 |
| --- |
| With v2 The Box supports [Onionoo](http://onionoo.torproject.org), the Tor network status protocol. In addition to the long term bandwidth data - which was added in the section **Bandwidth** next to the live bandwidth charts - The Box now presents a bunch of network status data like 'Consensus Weight' or 'Middle Probability' on dedicated charts:
| ![image](https://cloud.githubusercontent.com/assets/16342003/13537878/95f0e4ce-e247-11e5-85c1-bd3d16c6c9c4.png) |
| As this example shows, The Box thereby supports all level of details that are **provided** by the status protocol - and thus allows here to switch chart scale from '1 Week' to '3 Months'.

## Installation
The Box depends on some additional libraries, so make sure they are
installed:

* [psutil](https://pypi.python.org/pypi/psutil)
* [configparser](https://pypi.python.org/pypi/configparser)
* [stem](https://pypi.python.org/pypi/stem)
* [Bottle](https://pypi.python.org/pypi/bottle)

| NEW in v2 |
| --- |
| * [apscheduler](https://pypi.python.org/pypi/apscheduler)
| * [requests](https://pypi.python.org/pypi/requests)

| NEW in v3 |
| --- |
| ~~Additionally I recommend to install [CherryPy](https://pypi.python.org/pypi/CherryPy) as webserver to be used! (The Box runs as well with a standard server yet this one has issues with IE!)~~ 
| v3 comes bundled with a very performant websever. You might still use CherryPy - yet there's no true demand anymore.

## Configuration
### ... of The Onion Box
To adapt the Box to your Tor environment edit the configuration file located
in `~/config/theonionbox.cfg`. Every configuration option is well documented there
so it shouldn't be too difficult to get along.

### ... of Tor
The Box relies on Tor's authentication process to grant access. Therefore you **have to**
* make sure that you configured a ControlPort.
* set the `HashedControlPassword` option in Tor's config file and define a
password to access the ControlPort.

## Box Operations
Open a console and launch The Box with `python theonionbox.py`.

~~As of now there is no support to run The Box as a daemon. Be assured that this is part of the TODO - list.~~

| NEW in v2.1 |
| --- |
| Alternatively you could run The Box as a background service on _init_ based Linux systems. Check the [HowTo](https://github.com/ralphwetzel/theonionbox/wiki/Run-The-Onion-Box-as-a-background-service!) for the detailed procedure.|


To see your relay in action browse to the address you configured and log into the Box using the password you defined for the ConfigPort.

Leave me a message if you encounter any issues... which might probably happen! :cold_sweat:

Enjoy!