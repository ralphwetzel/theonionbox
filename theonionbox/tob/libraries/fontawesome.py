from typing import Optional
from bottle import Bottle, static_file, HTTPError
from plugin.session import SessionPlugin
from tob.session import SessionManager
import os.path


class FontAwesome(Bottle):

    def __init__(self, session_factory: SessionManager, lib_path: str, valid_status=None):

        super(FontAwesome, self).__init__()

        # self.base_path = base_path
        self.lib_path = lib_path

        config = {}

        if valid_status is not None:
            if not isinstance(valid_status, list):
                valid_status = [valid_status]

            config = {
                'valid_status': valid_status
            }

        self.route('/<session>/fontawesome/css/all.css',
                   method='GET',
                   callback=self.get_css,
                   apply=SessionPlugin(session_factory),
                   **config)

        self.route('/<session>/fontawesome/webfonts/<filename:'
                   're:fa-(?:brands|regular|solid)-(?:400|900)\\.(?:eot|ttf|woff|woff2)>',
                   method='GET',
                   callback=self.get_font,
                   apply=SessionPlugin(session_factory),
                   **config)

    def get_css(self, session):
        return static_file('all.css', root=os.path.join(self.lib_path, 'css'), mimetype='text/css')

    def get_font(self, session, filename):

        mime_type = {
            '.eot': 'application/vnd.ms-fontobject',
            '.ttf': 'application/font-sfnt',
            '.woff': 'application/font-woff',
            '.woff2': 'application/font/woff2'
        }

        fname, fxtension = os.path.splitext(filename)

        if fxtension not in mime_type:
            raise HTTPError(404)

        return static_file(filename, root=os.path.join(self.lib_path, 'webfonts'), mimetype=mime_type[fxtension])

