from wsgiserver import WSGIServer
import sys


class Server(WSGIServer):

    def error_log(self, msg="", level=20, traceback=False):
        # Override this in subclasses as desired
        import logging
        lgr = logging.getLogger('theonionbox')
        e = sys.exc_info()[1]
        if e.args[1].find('UNKNOWN_CA') > 0:
            lgr.warn("{} -> Your CA certificate could not be located or "
                        "couldn't be matched with a known, trusted CA.".format(e.args[1]))
        else:
            lgr.warn('HTTP Server: {}'.format(e.args[1]))

