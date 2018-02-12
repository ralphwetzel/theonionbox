from typing import Optional, Tuple, Dict
from time import time

class Recorder(object):
    ...

    def __init__(self,
                 interval: Optional[int]=1,
                 compensate: Optional[bool]=True,
                 timestamp: Optional[float]=time(),
                 **kwargs: float
                 ):
        ...

    def record(self,
               timestamp: Optional[float]=None,
               **kwargs: float) -> Optional[Dict[float, ...]]:
        ...

    def get_interval(self) -> float:
        ...