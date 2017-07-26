import uuid
from time import time

# This is the TTL (in seconds) of the Session on server side;
# Accessing the session resets the counter!
SESSION_MAX_TTL = 3600  # one hour


class SessionFactory(object):

    session_data_pool = {}
    session_ping_pool = {}
    session_addr_pool = {}
    latest_ping = None
    _time = None

    def __init__(self, time_manager, session_lifetime=SESSION_MAX_TTL, delete_session_callback = None):

        self.session_lifetime = session_lifetime if session_lifetime < SESSION_MAX_TTL else SESSION_MAX_TTL
        self._time = time_manager
        self.reset()
        self.del_callback = delete_session_callback

    def create(self, remote_addr, status):

        if remote_addr is None:
            return None

        # create a new session
        session_id = uuid.uuid4().hex
        self.session_data_pool[session_id] = {'status': status}

        self.latest_ping = self._time()
        self.session_ping_pool[session_id] = self.latest_ping

        self.session_addr_pool[session_id] = remote_addr

        return Session(session_id=session_id
                       , remote_addr=remote_addr
                       , session_data=self.session_data_pool[session_id]
                       , last_visit=self.latest_ping
                       , session_lifetime=self.session_lifetime
                       )

    def recall(self, session_id, remote_addr):

        if session_id not in self.session_data_pool:
            return None

        if self.session_addr_pool[session_id] != remote_addr:
            return None

        thats_now = self._time()
        seen_before = self.session_ping_pool[session_id]
        since_last_ping = thats_now - seen_before

        if since_last_ping > self.session_lifetime:
            return None

        self.latest_ping = thats_now
        self.session_ping_pool[session_id] = self.latest_ping

        return Session(session_id=session_id
                       , remote_addr=self.session_addr_pool[session_id]
                       , session_data=self.session_data_pool[session_id]
                       , last_visit=seen_before
                       , session_lifetime=self.session_lifetime
                       )

    def recall_unsafe(self, session_id, do_not_ping=True):

        if session_id not in self.session_data_pool:
            return None

        # if skip_addr_check is False:
        #     if self.session_addr_pool[session_id] != remote_addr:
        #         return None

        seen_before = self.session_ping_pool[session_id]

        if do_not_ping is False:
            self.latest_ping = self._time()
            self.session_ping_pool[session_id] = self.latest_ping

        return Session(session_id=session_id
                       , remote_addr=self.session_addr_pool[session_id]
                       , session_data=self.session_data_pool[session_id]
                       , last_visit=seen_before
                       , session_lifetime=self.session_lifetime
                       )

    def delete(self, session_id):
        if session_id in self.session_data_pool:
            # ensure external cleanuo
            if self.del_callback is not None:
                try:
                    self.del_callback(session_id)
                except:
                    pass

            del self.session_data_pool[session_id]
            del self.session_ping_pool[session_id]
            del self.session_addr_pool[session_id]

    # helpers for housekeeping!
    def latest_visit(self):
        return self.latest_ping

    def reset(self):
        self.session_data_pool = {}
        self.session_ping_pool = {}
        self.session_addr_pool = {}
        self.latest_ping = None

    def check_for_expired_session(self, remove_expired_session=False):

        keys = self.session_ping_pool.keys()
        thats_now = self._time()

        for key in keys:
            since_last_ping = thats_now - self.session_ping_pool[key]
            if since_last_ping > self.session_lifetime:
                if remove_expired_session is True:
                    self.delete(key)
                return key

        return None

    def sessions_count(self):
        return len(self.session_ping_pool.keys())


class Session(object):

    session_data = {}
    session_id = ''
    session_addr = '***'

    def __init__(self, session_id, remote_addr, session_data, last_visit, session_lifetime=None):
        self.session_data = session_data
        self.session_id = session_id
        self.session_addr = remote_addr
        self.last_visit = last_visit

    def __contains__(self, key):
        return key in self.session_data

    def __delitem__(self, key):
        if self.__contains__(key):
            del self.session_data[key]

    def __getitem__(self, key):
        if self.__contains__(key):
            return self.session_data[key]
        return None

    def __setitem__(self, key, value):
        self.session_data[key] = value

    def __len__(self):
        return len(self.session_data)

    def __iter__(self):
        for t in self.session_data:
            yield t

    def id(self):
        return self.session_id

    def id_short(self, chars=4):
        return make_short_id(self.session_id, chars)

    def remote_addr(self):
        return self.session_addr

    def last_visit(self):
        return self.last_visit

    def get(self, key, default=None):
        retval = self.__getitem__(key)
        if not retval:
            retval = default
        return retval

    def has_key(self, key):
        return self.__contains__(key)

    def items(self):
        return self.session_data.items()

    def keys(self):
        return self.session_data.keys()

    def values(self):
        return self.session_data.values()


# this allows us to reuse this code even if the session object is invalid!
def make_short_id(session_id, chars=4):
    retval = session_id
    if chars > len(retval):
        chars = 4
    return retval[:chars] + '|' + retval[-chars:]

