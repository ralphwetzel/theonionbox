from typing import Optional
from bottle import Bottle, static_file, HTTPError
from plugin.session import SessionPlugin
from tob.session import SessionManager
import os.path


class LatoLatin(Bottle):

    def __init__(self, session_factory: SessionManager, lib_path: str, valid_status=None):

        super(LatoLatin, self).__init__()

        # self.base_path = base_path
        self.lib_path = lib_path

        config = {}

        if valid_status is not None:
            if not isinstance(valid_status, list):
                valid_status = [valid_status]

            config = {
                'valid_status': valid_status
            }

        self.route('/<session>/latolatin/latolatinfonts.css',
                   method='GET',
                   callback=self.get_css,
                   apply=SessionPlugin(session_factory),
                   **config)

        self.route('/<session>/latolatin/fonts/<filename:'
                   're:LatoLatin-'
                   '(?:Black|Bold|Hairline|Heavy|Italic|Light|Medium|Regular|Semibold|Thin)(?:Italic)?'
                   '\\.(?:eot|ttf|woff|woff2)>',
                   method='GET',
                   callback=self.get_font,
                   apply=SessionPlugin(session_factory),
                   **config)

    def get_css(self, session):
        return static_file('latolatinfonts.css', root=self.lib_path, mimetype='text/css')

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

        return static_file(filename, root=os.path.join(self.lib_path, 'fonts'), mimetype=mime_type[fxtension])

