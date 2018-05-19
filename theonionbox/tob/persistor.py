import logging
import sqlite3
import tempfile
import os
from time import time


class Storage(object):

    path = None

    def __init__(self, path=None, user=None):

        log = logging.getLogger('theonionbox')
        self.path = None

        if path is None:
            path = tempfile.gettempdir()

        path = os.path.abspath(path)

        if os.access(path, os.F_OK | os.R_OK | os.W_OK) is True:

            if user is None or user == '':
                path = os.path.join(path, '.theonionbox.persist')
            else:
                path = os.path.join(path, '.theonionbox.{}'.format(user))
        else:
            log.warning("No permissions to access '{}' for data persistance. Trying to operate with in-memory database.".format(path))
            path = ':memory:'
        try:
            with sqlite3.connect(path) as conn:
                sql = "CREATE TABLE IF NOT EXISTS nodes (fp string PRIMARY KEY NOT NULL UNIQUE );"
                # The UNIQUE constraint ensures that there's always only one record per interval
                sql += """
                            CREATE TABLE IF NOT EXISTS bandwidth (fp int,
                                                                  interval text(2),
                                                                  timestamp int,
                                                                  read int,
                                                                  write int,
                                                                  UNIQUE (fp, interval, timestamp)
                                                                  ON CONFLICT REPLACE
                                                                  );
                        """
                conn.executescript(sql)
        except:
            log.warning("Failed to create persistance database @ '{}'.".format(path))
        else:
            log.notice("Persistance data will be written to '{}'.".format(path))
            self.path = path

    def get_path(self):
        return self.path


class BandwidthPersistor(object):

    def __init__(self, storage, fingerprint):

        self.path = None
        self.fp = None

        if len(fingerprint) == 0:
            log = logging.getLogger('theonionbox')
            log.info('Skipped registration for persistance of node with fingerprint of length=0.')
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
            log = logging.getLogger('theonionbox')
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
            self.fp = fpid

        conn.close()

    def open_connection(self, path=None):

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
    def persist(self, interval, timestamp, read=0, write=0, connection=None):

        if connection is None:
            connection = self.open_connection()
            if connection is None:
                return False

        try:
            connection.execute("INSERT INTO bandwidth(fp, interval, timestamp, read, write) VALUES(?, ?, ?, ?, ?)",
                               (self.fp, interval, timestamp, read, write))
        except Exception as e:
            return False

        return True

    # get the data back from the table
    def get(self, interval, js_timestamp=int(time()*1000), limit=-1, offset=0, connection=None):
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
                              'fp': self.fp,
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

