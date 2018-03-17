from __future__ import absolute_import
import json
import logging


class ManPage(object):

    def __init__(self, index_filename):

        self.success = False
        self.ndx = {}
        boxLog = logging.getLogger('theonionbox')

        try:
            with open(index_filename) as ndx_file:
                self.ndx = json.load(ndx_file)
        except Exception as exc:
            boxLog.warning("Failed to load index file for manpage. Exception raised says '{}'!".format(exc))
            pass
        else:
            boxLog.info("Manpage index file '{}' loaded.".format(index_filename))
            self.success = True

    def get_success(self):
        return self.success

    def get_sha(self):
        if 'sha' not in self.ndx:
            return None

        return self.ndx['sha']

    def get_groups(self):
        if 'groups' not in self.ndx:
            return None
        return self.ndx['groups']

    def get_options(self, group_name):
        key = group_name.replace(' ', '').lower()
        if key not in self.ndx:
            return None
        return self.ndx[key]
