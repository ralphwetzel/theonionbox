import sys
import platform


def create_system(system = None):

    if system is None:
        system = platform.system()

    if system == 'Linux':
        return LinuxSystem()
    elif system == 'Windows':
        return WindowsSystem()
    elif system == 'FreeBSD':
        return FreeBSDSystem()
    elif system == 'Darwin':
        return DarwinSystem()
    elif system == 'test':
        return TestSystem()
    else:
        return BaseSystem()


def warning(*objs):
    print(' ', *objs, file=sys.stderr)

class BaseSystem(object):

    _name = 'Unknown'
    _torrc_path = '/etc/tor/torrc'

    def __init__(self):
        # self._name = "'Unknown'"
        pass

    def name(self):
        return self._name

    def get_torrc_path(self):
        if isinstance(self._torrc_path, list):
            return self._torrc_path
        else:
            return [self._torrc_path]

    def warning_module_missing_psutil(self):
        warning("Required python module 'psutil' is missing.")
        warning("Check 'https://pypi.python.org/pypi/psutil' for installation instructions.")

    def warning_module_missing(self, module_name):
        warning("Required python module '{0}' is missing. You have to install it via 'pip install {0}'."
                .format(module_name))


class LinuxSystem(BaseSystem):

    def __init__(self):
        BaseSystem.__init__(self)
        self._name = 'Linux'

    def warning_module_missing_psutil(self):
        warning("Required python module 'psutil' is missing.")
        warning("You have to install it via 'pip install psutil'.")
        warning("If this fails, make sure the python headers are installed, too: 'apt-get install python-dev'.")


class WindowsSystem(BaseSystem):

    def __init__(self):
        BaseSystem.__init__(self)
        self._name = 'Windows'

    def warning_module_missing_psutil(self):
        warning("Required python module 'psutil' is missing.")
        warning("Check 'https://pypi.python.org/pypi/psutil' for an installer package.")


class FreeBSDSystem(BaseSystem):
    def __init__(self):
        BaseSystem.__init__(self)
        self._name = 'FreeBSD'


class DarwinSystem(BaseSystem):
    def __init__(self):
        BaseSystem.__init__(self)
        self._name = 'Darwin (Mac)'


class TestSystem(BaseSystem):

    _name = 'Test'
    


#    def __init__(self):
#        BaseSystem.__init__(self)
#        self._name = 'Test'


