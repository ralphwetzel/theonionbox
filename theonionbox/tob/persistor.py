from typing import Optional, List
import logging
import sqlite3
import tempfile
import os
from time import time
from sqlite3 import Connection, Row


class Storage(object):

    path = None

    def __init__(self, path: Optional[str] = None, user: Optional[str] = None):

        log = logging.getLogger('theonionbox')
        self.path = None

        if path is None:
            path = tempfile.gettempdir()
            log.debug("Temp directory identified as {}.".format(path))

        path = os.path.abspath(path)

        if user is None or user == '':
            path = os.path.join(path, '.theonionbox.persist')
        else:
            path = os.path.join(path, '.theonionbox.{}'.format(user))

        attempts = 0
        while attempts < 2:
            try:
                with sqlite3.connect(path) as conn:
                    sql = "CREATE TABLE IF NOT EXISTS nodes (fp string PRIMARY KEY NOT NULL UNIQUE );"
                    # The UNIQUE constraint ensures that there's always only one record per interval
                    sql += """CREATE TABLE IF NOT EXISTS bandwidth (fp int,
                                                                    interval text(2),
                                                                    timestamp int,
                                                                    read int,
                                                                    write int,
                                                                    UNIQUE (fp, interval, timestamp)
                                                                    ON CONFLICT REPLACE
                                                                    );"""
                    conn.executescript(sql)

                log.notice("Persistance data will be written to '{}'.".format(path))
                self.path = path
                return

            except:
                log.notice("Failed to create persistance database @ '{}'.".format(path))
                path = ':memory:'
                attempts += 1

        # At this point there's no persistance db created.
        # That's domague - yet inevitable.
        self.path = None

    def get_path(self) -> str:
        return self.path


class BandwidthPersistor(object):

    def __init__(self, storage: Storage, fingerprint: str):

        self.path = None
        self.fp = None
        self.fpid = None

        log = logging.getLogger('theonionbox')

        if len(fingerprint) == 0:
            log.debug('Skipped registration for persistance of node with fingerprint of length = 0.')
            return

        path = storage.get_path()
        if path is None:
            return

        conn = self.open_connection(path)
        if conn is None:
            return

        # register this fingerprint
        try:
            with conn:
                conn.execute("INSERT OR IGNORE INTO nodes(fp) VALUES(?);", (fingerprint,))
        except Exception as exc:
            log.warning('Failed to register {}... for persistance. {}'.format(fingerprint[:6], exc))
            return

        fpid = None
        r = None
        try:
            cur = conn.cursor()
            cur.execute("SELECT ROWID as id FROM nodes WHERE fp=?", (fingerprint,))
            r = cur.fetchone()
        except Exception as e:
            return

        # This indicates that fingerprint was successfully registered
        try:
            fpid = r['id']
        except Exception as e:
            return

        if fpid is not None:
            self.path = path
            self.fp = fingerprint
            self.fpid = fpid

        conn.close()

    def open_connection(self, path: Optional[str] = None) -> Optional[Connection]:

        if path is None:
            path = self.path

        if path is not None:
            try:
                conn = sqlite3.connect(path)
                conn.row_factory = sqlite3.Row
                return conn
            except Exception as e:
                log = logging.getLogger('theonionbox')
                log.warning('Failed to open connection to storage @ {}.'.format(path))

        return None

    # This does not commit!
    def persist(self, interval: str, timestamp: float,
                read: Optional[int] = 0, write: Optional[int] = 0, connection: Optional[Connection] = None) -> bool:

        if self.fpid is None:
            return False

        if connection is None:
            connection = self.open_connection()
            if connection is None:
                return False

        try:
            connection.execute("INSERT INTO bandwidth(fp, interval, timestamp, read, write) VALUES(?, ?, ?, ?, ?)",
                               (self.fpid, interval, timestamp, read, write))
        except Exception as e:
            log = logging.getLogger('theonionbox')
            log.warning(f'Failed to open persist bandwidth data for fingerprint {self.fp[:6]}: {e}')
            return False

        return True

    # get the data back from the table
    def get(self, interval: str, js_timestamp: Optional[int] = int(time()*1000), limit: Optional[int] = -1,
            offset: Optional[int] = 0, connection: Optional[Connection] = None) -> Optional[List[Row]]:
        if connection is None:
            connection = self.open_connection()
            if connection is None:
                return None

        # some SELECT magic to eliminate the need for later manipulation
        cur = connection.cursor()
        sql = """
            SELECT
              :jsts as 's', 
              timestamp * 1000 as 'm',
              read as 'r',
              write as 'w'
            FROM bandwidth
            WHERE fp = :fp AND interval = :interval
            ORDER BY timestamp DESC
            LIMIT :limit OFFSET :offset
        """

        try:
            cur.execute(sql, {'jsts': js_timestamp,
                              'fp': self.fpid,
                              'interval': interval,
                              'limit': limit,
                              'offset': offset}
                        )
        except Exception as e:
            log = logging.getLogger('theonionbox')
            log.warning('Failed to get persisted data: {}'.format(e))
            return None

        res = cur.fetchall()
        return res

