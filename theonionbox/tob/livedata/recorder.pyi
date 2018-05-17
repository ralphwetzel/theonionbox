from typing import Optional, Dict, Callable
from time import time

class Recorder(object):

    interval: int
    compensate: Callable[float]
    reference_slot: float
    basket: Dict[float]

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

    def _calc_slot(self,
                   timestamp: float) -> int:
        ...
