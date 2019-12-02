from bottle import request, HTTPError, redirect
from tob.session import SessionManager


class SessionPlugin(object):

    name = 'session'
    api = 2

    def __init__(self, manager: SessionManager):
        self.sm = manager

    def apply(self, callback, route):

        gcas = route.get_callback_args()
        if 'session' not in gcas:
            return callback

        def wrapper(*args, **kwargs):

            env = request.environ['route.url_args']
            session_id = env.get('session', None)

            redirect_path = route.config.get('no_session_redirect', None)

            valid_status = route.config.get('valid_status', None)

            if session_id is None or kwargs.get('session', None) is None:
                if redirect_path is None:
                    raise HTTPError(404)
                redirect(redirect_path)

            session = self.sm.get_session(session_id, request)
            failed = False

            if session is None:
                failed = True
            elif 'status' not in session:
                failed = True
            elif valid_status is not None:
                if session['status'] not in valid_status:
                    failed = True

            if failed is True:
                if redirect_path is None:
                    raise HTTPError(404)
                redirect(redirect_path)

            kwargs['session'] = session

            return callback(*args, **kwargs)

        return wrapper
