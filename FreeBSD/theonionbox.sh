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
#                               Default: /your/path/to/theonionbox ... which you obviously have to alter!
: ${theonionbox_dir="/your/path/to/theonionbox"}

# theonionbox_start_args (str): Command line parameters to be provided to theonionbox at start
#                               Refer to README for further details
#                               Default: (not used)
# Example: To define a configuration file
# : ${theonionbox_start_args="--config='${theonionbox_dir}/config/theonionbox.example'"}
# Another example: To switch on DEBUG mode
# : ${theonionbox_start_args="-d"}

# theonionbox_user (str):       TheOnionBox daemon user.
#                               Default: _tor
: ${theonionbox_user="_tor"}

# required_files=${theonionbox_conf}
required_dirs=${theonionbox_dir}
pidfile=${theonionbox_pidfile}

# Please ensure that this points to the python executable you intend to use!
# If you receive a "WARNING: $command_interpreter /[...]/python != /[...]/python3" (or similar), you most probably defined a path to a symlink.
# To avoid this WARNING, you should reference directly to the executable!
command_interpreter="${theonionbox_dir}/bin/python"

# That's our script
command="${theonionbox_dir}/bin/theonionbox"
procname="${command}"
start_cmd="/usr/sbin/daemon -S -T 'theonionbox' -u ${theonionbox_user} -p ${pidfile} ${command} ${theonionbox_start_args}"

# Let's go!
run_rc_command "$1"