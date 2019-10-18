import uuid
import time
from bottle import BaseRequest
from typing import Optional, Callable
import logging

# This is the TTL (in seconds) of the Session on server side;
# Accessing the session resets the counter!
SESSION_MAX_TTL = 3600  # one hour


class Session(object):

    _data = {}
    _id = ''
    # session_addr = '***'

    def __init__(self, id, data, expired: bool = False):
        self._id = id
        self._data = data
        self._expired = expired

    def __contains__(self, key):
        return key in self._data

    def __delitem__(self, key):
        if self.__contains__(key):
            del self._data[key]

    def __getitem__(self, key):
        if self.__contains__(key):
            return self._data[key]
        return None

    def __setitem__(self, key, value):
        self._data[key] = value

    def __len__(self):
        return len(self._data)

    def __iter__(self):
        for t in self._data:
            yield t

    @property
    def id(self):
        return self._id

    def id_short(self, chars=4):
        return make_short_id(self._id, chars)

    # @property
    # def remote_addr(self):
    #     return self._data.get('address', None)
    #
    # @property
    # def last_visit(self):
    #     return self._data.get('ping', None)

    def get(self, key, default=None):
        retval = self.__getitem__(key)
        if not retval:
            retval = default
        return retval

    @property
    def node(self):
        return self._data.get('node', None)

    @node.setter
    def node(self, value):
        self._data['node'] = value

    @property
    def expired(self):
        return self._expired

    # def has_key(self, key):
    #     return self.__contains__(key)

    # def items(self):
    #     return self._data.items()
    #
    # def keys(self):
    #     return self._data.keys()
    #
    # def values(self):
    #     return self._data.values()


class SessionManager(object):

    sessions = {}

    def __init__(self, lifetime=SESSION_MAX_TTL, delete_session_callback=None):

        self.lifetime = lifetime if lifetime < SESSION_MAX_TTL else SESSION_MAX_TTL
        self.delete_callback = delete_session_callback
        self.reset()
        self.log = logging.getLogger('theonionbox')

    def reset(self):
        self.sessions = {}

    def create_session(self, request: BaseRequest, status: Optional[str] = None):

        assert isinstance(request, BaseRequest)

        addr = request.environ.get('REMOTE_ADDR', None)
        port = request.environ.get('REMOTE_PORT', None)
        agent = request.environ.get('HTTP_USER_AGENT', None)

        if addr is None or port is None or agent is None:
            return None

        # create a new session
        id = uuid.uuid4().hex
        session = {
            'id': id,
            'address': addr,
            'port': port,
            'agent': agent,
            'data': {
                'status': status
            },
            'ping': time.time()
        }

        self.sessions[id] = session

        return Session(id=session['id'], data=session['data'])

    def get_session_without_validation(self, id: str) -> Optional[Session]:

        if id not in self.sessions:
            return None

        session = self.sessions[id]
        expired = (time.time() - session['ping'] > self.lifetime)

        return Session(id=id, data=session['data'], expired=expired)

    def get_session(self, id: str, request: BaseRequest) -> Optional[Session]:

        addr = request.environ.get('REMOTE_ADDR', None)
        agent = request.environ.get('HTTP_USER_AGENT', None)

        try:
            session = self.sessions[id]
            # print("{} => {}".format(s['port'], port))
            if session['address'] != addr or session['agent'] != agent:
                return None
        except:
            return None

        now = time.time()
        if now - session['ping'] > self.lifetime:
            return None
        session['ping'] = now

        # secret = session.get('secret', None)
        # value = session.get('value', None)
        # cookie = request.get_cookie('TheOnionBox', secret=secret)

        return Session(id=id, data=session['data']) # if cookie == value else None

    def delete_session(self, session: Session, callback: Optional[Callable[[str], None]]=None):
        assert isinstance(session, Session)
        self.delete_session_by_id(session.id, callback)

    def delete_session_by_id(self, id: str, callback: Optional[Callable[[str], None]]=None):
        if id in self.sessions:
            self.log.debug("Deleting session {}.".format(make_short_id(id)))
            # ensure external cleanup
            if callback is None:
                callback = self.delete_callback
            try:
                callback(id)
            except:
                pass
            del self.sessions[id]

    # def get_id_of_expired_session_xx(self, remove_expired_session=False):
    #
    #     now = time.time()
    #     for id, session in self.sessions.items():
    #
    #         if now - session['ping'] > self.lifetime:
    #             if remove_expired_session is True:
    #                 self.delete_session(session)
    #             return id
    #
    #     return None

    def get_remote_address(self, id):
        if id in self.sessions:
            return self.sessions[id].get('address', None)

    def get_remote_port(self, id):
        if id in self.sessions:
            return self.sessions[id].get('port', None)

    # def create_cookie_value(self, session: Session, secret: str) -> str:
    #     s = self.sessions[session.id]
    #     s['secret'] = secret
    #     s['value'] = uuid.uuid4().hex
    #     return s['value']

    def __iter__(self) -> Session:

        for key in self.sessions:
            session = self.sessions[key]

            # Do not return expired sessions!
            now = time.time()
            if now - session['ping'] > self.lifetime:
                continue

            yield Session(id=key, data=session['data'])

# this allows us to reuse this code even if the session object is invalid!
def make_short_id(session_id, chars=4):
    retval = session_id
    if chars > len(retval):
        chars = 4
    return retval[:chars] + '|' + retval[-chars:]