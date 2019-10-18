from typing import Optional, Union, List
from pathlib import Path, PurePath
from re import escape

from bottle import Bottle, static_file, HTTPError, HTTPResponse

from tob.plugin.session import SessionPlugin
from tob.session import SessionManager


class Base(Bottle):

    def __init__(self, session_factory: SessionManager, route_segment: str = '/'):

        super(Base, self).__init__()
        self.session_factory = session_factory

        route_segment = route_segment.lstrip('/')
        route_segment = route_segment.rstrip('/')

        self.segment = route_segment.split('/') if len(route_segment) > 0 else []
        self.files = {}

        self.mime_types = {
            'css': 'text/css',
            'js': 'text/javascript'
        }

    def add(self, local_path: Union[PurePath, Path, str], request_file_name: str,
            method: str = 'GET',
            mime_type: Optional[str] = None,
            valid_status: Union[List[str], str, None] = None) -> str:

        assert method in ['GET', 'POST']
        # assert(request_file_name not in self.files)

        config = {}
        if valid_status is not None:
            config['valid_status'] = [valid_status] if not isinstance(valid_status, list) else valid_status

        if mime_type is None:
            m = request_file_name.split('.')
            mime_type = m[-1]

        assert mime_type in self.mime_types

        if request_file_name[0] != '/':
            # a relative path -> add the segment
            rfn = self.segment
            rfn.extend(request_file_name.split('/'))
        else:
            # absolute path. no segment
            rfn = request_file_name[1:].split('/')
            assert len(rfn) > 0

        if isinstance(local_path, str):
            local_path = Path(local_path)

        if isinstance(local_path, Path):
            # this is omitted for a PurePath
            assert local_path.exists()

        rfn = '/'.join(rfn)

        self.files[rfn] = {
            'file': str(local_path.name),
            'path': str(local_path.parent),
            'mime': mime_type
        }

        route = '/<session>/<filename:re:{}>'.format(escape(rfn))
        self.route(route,
                   method=method,
                   callback=self.serve,
                   apply=SessionPlugin(self.session_factory),
                   **config)

        return rfn

    def serve(self, session, filename = None):

        if filename in self.files:

            f = self.files[filename]

            return static_file(filename=f['file'],
                               root=f['path'],
                               mimetype=self.mime_types[f['mime']])

        raise HTTPError(404)


class StaticFileProvider(Base):

    def __init__(self, session_factory: SessionManager,
                 filepath: Union[Path, str, None] = None, route: Union[str, None] = None,
                 method: str = 'GET',
                 mime_type: Optional[str] = None,
                 valid_status: Union[List[str], str, None] = None):

        # r = route.split('/')
        # segment = '/'.join(r[:-1]) if len(r) > 1 else ''

        super(StaticFileProvider, self).__init__(session_factory)

        if filepath is not None and route is not None:
            self.add(local_path=filepath,
                     request_file_name=route,
                     method=method,
                     mime_type=mime_type,
                     valid_status=valid_status
                     )


class SessionFileProvider(StaticFileProvider):

    def serve(self, session, filename=None):

        if filename in session['scripts'] or filename in session['stylesheets']:
            return StaticFileProvider.serve(self, session, filename)

        raise HTTPError(404)


class TemplateFileProvider(Base):

    def __init__(self, session_factory: SessionManager,
                 filename: Optional[str] = None, route: Optional[str] = None,
                 method: str = 'GET',
                 mime_type: Optional[str] = None,
                 valid_status: Union[List[str], str, None] = None):

        # r = route.split('/')
        # segment = '/'.join(r[:-1]) if len(r) > 1 else ''

        super(TemplateFileProvider, self).__init__(session_factory)

        if filename is not None and route is not None:
            self.add(local_path=filename,
                     request_file_name=route,
                     method=method,
                     mime_type=mime_type,
                     valid_status=valid_status
                     )

    def add(self, local_path: str, request_file_name: str,
            method: str = 'GET',
            mime_type: Optional[str] = None,
            valid_status: Union[List[str], str, None] = None) -> str:

        path = PurePath(local_path)
        return Base.add(self, path, request_file_name, method, mime_type, valid_status)

    def serve(self, session, filename=None):

        if filename in session['scripts'] or filename in session['stylesheets']:

            if filename in self.files:
                f = self.files[filename]

                if f['file'] in session:
                    file = session[f['file']]

                    # 3.0.4
                    session[f['file']] = None

                    if file is not None:

                        headers = {'Content-Type': '{}; charset=UTF-8'.format(self.mime_types[f['mime']])}
                        return HTTPResponse(file, **headers)

        # This happens as well when the file is requested more than once!
        raise HTTPError(404)
