from typing import Optional
from tob.session import Session
from bottle import HTTPError
from base64 import b64decode
from hashlib import md5
from stem.connection import IncorrectPassword
from tob.nodes.node import Node
from uuid import uuid1, uuid4


def authenticate(session: Session, node: Node, header: str, method: str = "GET"):

    # from bottlepy
    def tob(s, enc='utf8'):
        return s.encode(enc) if isinstance(s, str) else bytes(s)

    def touni(s, enc='utf8', err='strict'):
        if isinstance(s, bytes):
            return s.decode(enc, err)
        else:
            return str(s or ("" if s is None else s))

    raise_login = True
    realm = "user@TheOnionBox"
    auth_scheme = "TheOnionBox"

    if header != '':
        try:
            scheme, data = header.split(None, 1)
            if scheme == auth_scheme:

                # Basic Authentication
                if session['auth'] == 'basic':
                    user, pwd = touni(b64decode(tob(data))).split(':', 1)

                    if user == session.id:
                        node.controller.authenticate(password=pwd)
                        raise_login = False

                # Digest Authentication
                elif session['auth'] == 'digest':

                    # the data comes as in as 'key1="xxx...", key2="xxx...", ..., key_x="..."'
                    # therefore we split @ ', '
                    # then remove the final '"' & split @ '="'
                    # to create a nice dict.
                    request_data = dict(item[:-1].split('="') for item in data.split(", "))

                    ha1_prep = (session.id + ":" + realm + ":" + node.controller.password).encode('utf-8')
                    ha1 = md5(ha1_prep).hexdigest()
                    ha2_prep = (method + ":" + request_data['uri']).encode('utf-8')
                    ha2 = md5(ha2_prep).hexdigest()
                    resp_prep = (ha1 + ":{}:".format(session['nonce']) + ha2).encode('utf-8')
                    response = md5(resp_prep).hexdigest()

                    # print(response)
                    # print(request_data['response'])

                    if response == request_data['response']:
                        node.controller.authenticate(password=node.controller.password)
                        raise_login = False

        except Exception as e:
            print(e)
            pass

    if raise_login:
        acc_denied = HTTPError(401, 'Access denied!')

        # Request Basic Authentication
        if session['auth'] == 'basic':
            acc_denied.add_header('WWW-Authenticate', '{} realm={}'.format(auth_scheme, realm))

        # Request Digest Authentication
        else:
            session['nonce'] = uuid1().hex
            session['opaque'] = uuid4().hex
            header = '{} realm={}, nonce={}, opaque={}'
            header = header.format(auth_scheme, realm, session['nonce'], session['opaque'])
            acc_denied.add_header('WWW-Authenticate', header)

        raise acc_denied

    # at this stage, authentication was passed!
    return node.controller.password