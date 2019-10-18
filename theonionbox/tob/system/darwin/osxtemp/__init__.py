from ctypes import CDLL, c_int, byref, c_double
import sys, os, inspect
from typing import Optional


def get_script_dir(follow_symlinks: bool=True) -> str:
    if getattr(sys, 'frozen', False):  # py2exe, PyInstaller, cx_Freeze
        path = os.path.abspath(sys.executable)
    else:
        path = inspect.getabsfile(get_script_dir)
    if follow_symlinks:
        path = os.path.realpath(path)
    return os.path.dirname(path)


class Sensors(object):
    AMBIENT_AIR_0 = b"TA0P"
    AMBIENT_AIR_1 = b"TA1P"
    CPU_0_DIODE = b"TC0D"
    CPU_0_HEATSINK = b"TC0H"
    CPU_0_PROXIMITY = b"TC0P"
    ENCLOSURE_BASE_0 = b"TB0T"
    ENCLOSURE_BASE_1 = b"TB1T"
    ENCLOSURE_BASE_2 = b"TB2T"
    ENCLOSURE_BASE_3 = b"TB3T"
    GPU_0_DIODE = b"TG0D"
    GPU_0_HEATSINK = b"TG0H"
    GPU_0_PROXIMITY = b"TG0P"
    HARD_DRIVE_BAY = b"TH0P"
    MEMORY_SLOT_0 = b"TM0S"
    MEMORY_SLOTS_PROXIMITY = b"TM0P"
    NORTHBRIDGE = b"TN0H"
    NORTHBRIDGE_DIODE = b"TN0D"
    NORTHBRIDGE_PROXIMITY = b"TN0P"
    THUNDERBOLT_0 = b"TI0P"
    THUNDERBOLT_1 = b"TI1P"
    WIRELESS_MODULE = b"TW0P"


class Units(object):
    CELSIUS = 0
    FAHRENHEIT = 1
    KELVIN = 2


class Temperature(object):

    def __init__(self, sensor: str=Sensors.CPU_0_PROXIMITY, unit: int=Units.CELSIUS):
        self.conn = c_int(0)
        self.sensor_key = sensor
        self.unit = unit
        self.libsmc = CDLL(os.path.join(get_script_dir(), 'libsmc.dylib'))

    def __call__(self, sensor: Optional[str]=None, unit: Optional[int]=None) -> float:

        if self.conn.value == 0:
            err = "osxtemp: Failed to open SMC port."
            try:
                if self.libsmc.open_smc_conn(byref(self.conn)) != 0:  #kIOReturnSuccess:
                    raise IOError(err)
            except:
                raise OSError(err)

        sk = self.sensor_key
        if sensor is not None:
            sk = sensor
            if isinstance(sensor, str):
                sk = sk.encode()

        unt = self.unit
        if unit is not None:
            unt = unit

        get_tmp_conn = self.libsmc.get_tmp_conn
        get_tmp_conn.restype = c_double

        temp = get_tmp_conn(self.conn, sk, unt)

        if temp != 0:
            return temp

        raise IOError('osxtemp: Failed to read temperature from sensor "{}".'.format(sk))

    def get_sensor_temp(self, sensor: str=Sensors.CPU_0_PROXIMITY, unit: int=Units.CELSIUS) -> float:
        return self.__call__(sensor=sensor, unit=unit)

    def __del__(self):

        if self.conn.value != 0:
            self.libsmc.close_smc_conn(self.conn)

