#!/bin/sh
#
# PROVIDE: theonionbox
# REQUIRE: DAEMON FILESYSTEMS
# BEFORE: LOGIN

# FreeBSD tutorial for rc.d: https://www.freebsd.org/doc/en_US.ISO8859-1/articles/rc-scripting/rcng-dummy.html

# Add the following line to /etc/rc.conf to enable TheOnionBox.
# theonionbox_enable (bool):	Set it to "YES" to enable TheOnionBox. Default: NO

# To achieve this, run the following line from the shell:
# echo “theonionbox_enable=YES” >>/etc/rc.conf

. /etc/rc.subr

name="theonionbox"
rcvar=theonionbox_enable

load_rc_config ${name}

: ${theonionbox_enable="NO"}
: ${theonionbox_pidfile="/var/run/${name}.pid"}

#
# Set the following lines according to your installation:
#

# theonionbox_dir (str):        Points to your theonionbox directory
#			                    Default: /your/path/to/theonionbox ... which you obviously have to alter!
: ${theonionbox_dir="/your/path/to/theonionbox"}

# theonionbox_conf (str):       Points to your onionbox.cfg file.
#                               Default: $(theonionbox_dir)/config/theonionbox.cfg
: ${theonionbox_conf="${theonionbox_dir}/config/theonionbox.cfg"}

# theonionbox_user (str):	    TheOnionBox daemon user.
#                               Default: _tor
#                               Please ensure that this user has write privileges to '{theonionbox_dir}/log'
: ${theonionbox_user="_tor"}

required_files=${theonionbox_conf}
required_dirs=${theonionbox_dir}
pidfile=${theonionbox_pidfile}

# Please ensure that there is this symlink to the python version you intend to use!
command_interpreter="/usr/local/bin/python"

# Redirecting to syslog!
# For FreeBSD / bourne shell: http://tomecat.com/jeffy/tttt/shredir.html

# Attention:
# We're @ FreeBSD, thus '--id' command line parameter is not available (checked with: 12-current)
# https://www.freebsd.org/cgi/man.cgi?query=logger&apropos=0&sektion=1&manpath=FreeBSD+12-current&arch=default&format=html
# => Consider implementing this once supported:

## logger -t ${name} --id=\$\$
## Notice the '--id=\$\$"? This ensures that the PID of the daemon
## (which is the PPID of the launching bash) is appended to the syslog identifier!

# That's our script
command="${theonionbox_dir}/theonionbox.py --config='${theonionbox_conf}' 2>&1 | logger -t ${name}"
start_cmd="/usr/sbin/daemon -u ${theonionbox_user} -p ${pidfile} ${command}"

# Let's go!
run_rc_command "$1"

