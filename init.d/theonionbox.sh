#!/bin/bash

#####
# This script is based on a great tutorial of SC Phillips
# http://blog.scphillips.com/posts/2013/07/getting-a-python-script-to-run-in-the-background-as-a-service-on-boot/
#

### BEGIN INIT INFO
# Provides:          theonionbox
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: The Onion Box: WebInterface to monitor Tor node operations
# Description:       http://www.theonionbox.com
### END INIT INFO

# Adapt this to provide the path to the root directory of the virtual environment you created for your box
DIR=/the/path/to/your/virtual_env
# usually no need to change the next two lines!
DAEMON=$DIR/bin/theonionbox
DAEMON_NAME=theonionbox

# This next line determines what user the script runs as.
DAEMON_USER=debian-tor

# Add any command line options for your daemon here:
# If you e.g. want your box to create additional log files, enable this here!
# DAEMON_OPTS="--log=$DIR"
# HeadsUp! You then have to ensure that DAEMON_USER has write privileges to $DIR!
DAEMON_OPTS=""

#####
# *** No need to change anything below this line! ***
#

# The process ID of the script when it runs is stored here:
PIDFILE=/var/run/$DAEMON_NAME.pid

. /lib/lsb/init-functions

# Redirecting to syslog!
# http://urbanautomaton.com/blog/2014/09/09/redirecting-bash-script-output-to-syslog/

# Notice the '--id=\$\$"? This ensures that the PID of the daemon
# (which is the PPID of the launching bash) is appended to the syslog identifier!

do_start () {
    log_daemon_msg "Starting system $DAEMON_NAME daemon"
    start-stop-daemon --start --background --pidfile $PIDFILE --make-pidfile --user $DAEMON_USER \
                      --chuid $DAEMON_USER \
                      --startas /bin/bash \
                      -- -c "exec $DAEMON $DAEMON_OPTS 1> >( logger -t $DAEMON_NAME --id=\$\$) 2>&1"
    log_end_msg $?
}

do_stop () {
    log_daemon_msg "Stopping system $DAEMON_NAME daemon"
    start-stop-daemon --stop --pidfile $PIDFILE --retry 10
    log_end_msg $?
}

case "$1" in

    start|stop)
        do_${1}
        ;;

    restart)
        do_stop
        do_start
        ;;

    status)
        status_of_proc "$DAEMON_NAME" "$DAEMON" && exit 0 || exit $?
        ;;

    *)
        echo "Usage: /etc/init.d/$DAEMON_NAME {start|stop|restart|status}"
        exit 1
        ;;

esac
exit 0