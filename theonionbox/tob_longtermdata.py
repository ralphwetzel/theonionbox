import os
import sqlite3
import threading
from time import time


class DatabaseManager(object):

    conn = {}
    fingerprint = None
    path = None
    last_bandwidth_not_zero = False

    # used 'status' codes:
    # 0: None
    # 1: we know that the database file @ path is accessible
    # 2: we know that there's a table for the given fingerprint
    status = 0

    def __init__(self):
        pass

    def log(self, message):
        print('LongTerm Data: {}'.format(message))

    def prepare(self, fingerprint, path=r'data/theonionbox.data'):

        if self.verify_db(path):
            self.path = path
            self.status = 1
            if self.verify_table(fingerprint):
                self.fingerprint = fingerprint
                self.status = 2

    def verify_db(self, path):

        path = os.path.normpath(path)
        path_path, path_file = os.path.split(path)

        if path_path and not os.path.isdir(path_path):
            self.log("Failed to open database '{}'. Directory '{}' does not exist.".format(path, path_path))
            return False

        try:
            conn = sqlite3.connect(path)
        except sqlite3.OperationalError as exc:
            self.log("Failed to open database '{}'.".format(path))
            return False

        thread_id = threading.current_thread()
        self.conn[thread_id] = conn

        self.log("Operating with database '{}'".format(path))
        return True

    def verify_table(self, fingerprint, create=True):

        if not self.status > 0:
            return False

        conn = self._get_connection()
        if not conn:
            self.log("Failed to get DB connection!")
            return False

        c = conn.cursor()
        rows = c.execute("pragma table_info('{}')".format(fingerprint))

        table_scheme = {'timestamp': False, 'bw_up': False, 'bw_down': False}
        table_version = 0

        # Every column will be represented by a tuple with the following attributes:
        # (id, name, type, notnull, default_value, primary_key)
        for row in rows:

            name = row[1]
            default = row[4]

            if name in table_scheme:
                table_scheme[name] = True

            if name == 'timestamp':
                table_version = int(default)

        table_exists = True
        for c in table_scheme:
            if not table_scheme[c]:
                table_exists = False

        if not table_exists:
            if create:
                self.log("Creating LongTerm Storage for fingerprint '{}'".format(fingerprint))

                sql = "CREATE TABLE '{}' (timestamp INTEGER NOT NULL DEFAULT (1), bw_up INTEGER, bw_down INTEGER);"
                conn.execute(sql.format(fingerprint))

                return self.verify_table(fingerprint, False)

            else:
                self.log("Failed to establish storage for fingerprint '{}'.".format(fingerprint))
                return False

        self.log("Storage for fingerprint '{}' established.".format(fingerprint))

        self.last_bandwidth_not_zero = True
        self.save(time(), 0, 0)     # to make sure things look nice later!

        return True

    def save(self, timestamp=None, bw_up=0, bw_down=0):

        if self.status < 2:
            return False

        conn = self._get_connection()
        if not conn:
            return False

        new_lbwnz = bw_up > 0 or bw_down > 0     # True if there's data to be recorded

        if new_lbwnz or self.last_bandwidth_not_zero:       # This ensures, that we're recording once '0,0' after data

            sql = "insert into '{}' values (?, ?, ?)".format(self.fingerprint)
            conn.execute(sql, (round(timestamp*1000), bw_up, bw_down))
            conn.commit()

            self.last_bandwidth_not_zero = new_lbwnz

        return True

    def _get_connection(self):

        # Per standard sqlite3 doesn't allow to use connection objects for different threads
        # This logic ensures that each thread receives it's own connection object
        thread_id = threading.current_thread()

        if thread_id in self.conn:
            return self.conn[thread_id]
        elif self.path:
            conn = sqlite3.connect(self.path)
            self.conn[thread_id] = conn
            return conn

        return None
