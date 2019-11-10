from typing import Optional

import os
import platform

from threading import RLock
from collections import deque

import itertools
from psutil import virtual_memory, cpu_percent # to readout the cpu load

from tob.deviation import getTimer


class BaseSystem(object):

    def __init__(self):
        self.__user = None
        self.lock = RLock()
        self.data = deque(maxlen=1000)

    # @staticmethod
    # def is_temperature_available() -> bool:
    #     return False

    @property
    def uptime(self) -> Optional[str]:
        return None

    @property
    def temperature(self) -> Optional[float]:
        return None

    @property
    def system(self) -> str:
        return 'Generic'

    @property
    def ntp(self) -> Optional[str]:
        return None

    @property
    def name(self) -> str:
        return platform.node()

    @property
    def release(self) -> str:
        return platform.release()

    @property
    def version(self) -> str:
        return platform.version()

    @property
    def machine(self) -> str:
        return platform.machine()
    
    @property
    def processor(self) -> str:
        return platform.processor()

    @property
    def venv(self) -> Optional[str]:
        return os.getenv('VIRTUAL_ENV', None)

    @property
    def user(self) -> Optional[str]:

        if self.__user is None:

            # Try to load pwd, fallback to getpass if unsuccessful
            try:
                import pwd
                self.__user = pwd.getpwuid(os.geteuid()).pw_name
            except ImportError:
                try:
                    import getpass
                    self.__user = getpass.getuser()
                except:
                    pass

        return self.__user

    @property
    def memory(self) -> Optional[int]:
        try:
            from psutil import virtual_memory
            return virtual_memory().total
        except:
            return None

    @property
    def memoryMB(self) -> Optional[int]:

        mem = self.memory
        if mem is None:
            return mem

        return int(mem / (1024 ** 2))

    def record_performance_data(self):

        timestamp = getTimer()() * 1000  # has to be converted to ms as JS expects ms!

        # we always catch the current cpu load
        cpu = {}
        count = 0

        # first: overall cpu load:
        cpu['c'] = cpu_percent(None, False)

        # notice: psutil.cpu_percent() will return a meaningless 0.0 when called for the first time
        # this is not nice yet doesn't hurt!
        for cx in cpu_percent(None, True):
            cpu['c%s' % count] = cx
            count += 1

        cpu['s'] = timestamp

        # ... and the percentage of memory usage
        cpu['mp'] = virtual_memory().percent

        t = self.temperature
        if t is not None:
            cpu['t'] = t

        # append the data to the list
        with self.lock:
            self.data.append(cpu)

    def get_performance_data(self, after: int = None):

        with self.lock:
            if after is None or after == 0:
                ret = list(self.data)
            else:
                ret = list(itertools.dropwhile(lambda x: x['s'] < after, self.data))

        return ret

    def run(self, launch, stop):
        return launch()

def get_system_manager(system: str = platform.system()) -> BaseSystem:

    if system == 'Darwin':
        from .darwin import Darwin
        return Darwin()
    elif system == 'FreeBSD':
        from .freebsd import FreeBSD
        return FreeBSD()
    elif system == 'Linux':
        from .linux import Linux
        return Linux()
    elif system == 'Windows':
        from .windows import Windows
        return Windows()
    else:
        return BaseSystem()
