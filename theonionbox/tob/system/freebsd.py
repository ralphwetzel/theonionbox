from typing import Optional, Callable

from datetime import datetime, timedelta
import logging
import subprocess
import time

from . import BaseSystem


class FreeBSD(BaseSystem):

    def __init__(self):
        super(FreeBSD, self).__init__()
        self.__ntp = None
        self.__uptime = None

    @property
    def system(self) -> str:
        return 'FreeBSD'

    # @staticmethod
    # def is_temperature_available() -> bool:
    #
    #     try:
    #         temp = subprocess.check_output('sysctl -a | grep hw.acpi.thermal.tz0.temperature', shell=True).decode('utf-8').split()
    #     except Exception:
    #         return False
    #     else:
    #         return temp[0] == 'hw.acpi.thermal.tz0.temperature:'

    @property
    def temperature(self) -> Optional[float]:

        temp = None

        # This is EXTREMELY slow!
        # => Disabled!!
        if True is False:

            try:
                temp = subprocess.check_output('sysctl -a | grep hw.acpi.thermal.tz0.temperature', shell=True)
                temp = temp.decode('utf-8').split()
            except:
                temp = None
            else:
                if len(temp) == 2:
                    try:
                        temp = float(temp[1].strip().rstrip('C'))
                    except:
                        temp = None

        return temp

    @property
    def uptime(self) -> Optional[str]:

        if self.__uptime is None:

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
                        log = logging.getLogger('theonionbox')
                        log.debug('Uptime information parsing error: {}'.format(exc))
                    else:
                        if upt.year == 1900:
                            its_now = datetime.fromtimestamp(time.time())
                            upt = upt.replace(year=its_now.year)

                        self.__uptime = upt.strftime('%Y-%m-%d %H:%M:%S')

        return self.__uptime
