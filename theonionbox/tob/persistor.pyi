from typing import Optional, Dict, Callable, Tuple, List
from sqlite3 import Connection, Cursor
from time import time

class Storage(object):

    path: str

    def __init__(self, path: Optional[str]=None, user: Optional[str]=None):
        ...

    def get_path(self) -> Optional[str]:
        ...


class BandwidthPersistor(object):

    path: str
    fp: int

    def __init__(self, storage: Storage, fingerprint: str):
        ...

    def open_connection(self, path: Optional[str]=None) -> Connection:
        ...

    def persist(self,
                interval: str,
                timestamp: float,
                read: Optional[int]=0,
                write: Optional[int]=0,
                connection: Optional[Connection] = None,
                commit: Optional[bool] = True,
                ) -> bool:
        ...

    def commit(self) -> bool:
        ...

    def get(self, interval: str,
            js_timestamp: Optional[int] = int(time() * 1000),
            limit: Optional[int] = -1,  # means 'unlimited'
            offset: Optional[int] = 0,
            connection: Optional[Connection] = None,
            ) -> Optional[List]:
        ...

