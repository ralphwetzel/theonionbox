from typing import Optional, Callable

from datetime import datetime, timedelta
import inspect
import logging
import os.path
import re
import subprocess
import time

from .. import BaseSystem


class Windows(BaseSystem):

    def __init__(self):
        super(Windows, self).__init__()
        self.__ntp = None
        self.__uptime = None

    @property
    def system(self) -> str:
        return 'Windows'

    @property
    def temperature(self) -> Optional[float]:
        # @ the Windows users: Sorry folks! Windows needs admin rights to access the temp sensor.
        # As long as this is the case Temperature display will not be supported on Windows!!
        return None

    @property
    def uptime(self) -> Optional[str]:

        if self.__uptime is None:

            # Due to the situation that there is no 'reliable' way to retrieve the uptime
            # on Windows, we rely on a third party tool:
            # uptime version 1.1.0: http://uptimeexe.codeplex.com/
            # Using v1.1.0 is critical/mandatory as the output changed from prior versions!
            # We expect to find this uptime.exe in ./uptime!

            path = os.path.dirname(inspect.getfile(Windows))
            path = os.path.join(path, 'uptime/uptime.exe')

            try:
                upt_v = subprocess.check_output('{} -v'.format(path)).decode('utf-8').strip()
            except:
                log = logging.getLogger('theonionbox')
                log.debug("Failed to run 'uptime' tool (http://uptimeexe.codeplex.com). "
                          "Check documentation for further instructions!")
            else:
                # expected output format is exactly 'version 1.1.0'
                if upt_v == 'version 1.1.0':
                    try:

                        uptimes = subprocess.check_output(path).decode('utf-8').split()

                        # expected output format is now e.g. '22:23:43 uptime 02:16:21'
                        if len(uptimes) == 3 and uptimes[1] == 'uptime':
                            upt = uptimes[2].split(':')
                            if len(upt) == 3:
                                its_now = datetime.fromtimestamp(time.time())
                                upt_diff = timedelta(hours=int(upt[0]),
                                                     minutes=int(upt[1]),
                                                     seconds=int(upt[2]),
                                                     microseconds=its_now.microsecond)
                                self.__uptime = (its_now - upt_diff).strftime('%Y-%m-%d %H:%M')
                    except Exception:
                        pass
                else:
                    log = logging.getLogger('theonionbox')
                    log.debug("Found 'uptime' tool yet version is not v1.1.0. "
                              "Check documentation for further instructions!")

        return self.__uptime

    @property
    def ntp(self) -> Optional[str]:

        if self.__ntp is None:

            try:
                # Get the known timeservers from the registry
                reg = subprocess.check_output(['reg',
                                               'query',
                                               'HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\DateTime\Servers'])
                reg = reg.decode("utf-8")

                # HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\DateTime\Servers
                #     (Standard)    REG_SZ    1
                #     1    REG_SZ    time.windows.com   <===
                #     2    REG_SZ    time.nist.gov      <===

                regex = r"^\s+\d+\s+REG_SZ\s+(.+)"
                ntps = re.findall(regex, reg)

                if len(ntps) > 0:
                    self.__ntp = ntps[0]

            except Exception:
                pass

        return self.__ntp