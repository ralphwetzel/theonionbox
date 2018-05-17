from typing import Optional
from ctypes import c_int

class Temperature(object):

    conn: c_int
    libsmc: ...
    sensor_key: str
    unit: int

    def __init__(self, sensor: Optional[str] = '', unit: Optional[int] = ''):
        ...

    def __call__(self, sensor: Optional[str], unit: Optional[int]) -> float:
        ...

    def get_sensor_temp(self, sensor: Optional[str], unit: Optional[int]) -> float:
        ...

    def __del__(self):
        ...