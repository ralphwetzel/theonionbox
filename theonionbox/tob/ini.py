#####
# Custom convenience interface to ConfigParser (python2) & configparser (python3)
# Intension is to eliminate the need to import 3rd party modules with further dependencies

### Check for Python2 or Python 3
import sys
py = sys.version_info
py30 = py >= (3, 0, 0)

if py30:
    from configparser import ConfigParser as ConfParser, DuplicateSectionError, NoOptionError
else:
    from ConfigParser import RawConfigParser as ConfParser, DuplicateSectionError, NoOptionError

__all__ = ['INIParser', 'DuplicateSectionError']


class INIParser(object):

    class INISection(object):

        def __init__(self, parser, section):
            self.parser = parser
            self.section = section

        def key(self):
            return self.section

        def getint(self, option, default=None):
            try:
                retval = self.parser.getint(self.section, option)
            except (ValueError, KeyError, NoOptionError) as e:
                retval = default
            return retval

        def getboolean(self, option, default=None):
            try:
                retval = self.parser.getboolean(self.section, option)
            except (ValueError, KeyError, NoOptionError) as e:
                retval = default
            return retval

        def get(self, option, default=None):
            try:
                retval = self.parser.get(self.section, option)
            except (ValueError, KeyError, NoOptionError) as e:
                retval = default
            return retval

    def __init__(self, filename):

        self.cp = ConfParser()
        self.file = filename
        # This may raise an exception!
        self.cp.read(filenames=filename)

    def filename(self):
        return self.file

    def sections(self):
        if self.cp is not None:
            secs = self.cp.sections()
            retval = []
            for sec in secs:
                retval.append(self.INISection(self.cp, sec))
            return retval

    def keys(self):
        if self.cp is not None:
            return self.cp.sections()

    def __call__(self, key):
        if key not in self.keys():
            return KeyError

        return self.INISection(self.cp, key)