import os


class Configuration(object):

    def __init__(self):
        self.torrc = None
        self.defaults = None

    def set_torrc(self, torrc):

        if not os.path.exists(torrc):
            return False

        self.torrc = torrc
        return True

    def set_defaults(self, defaults):

        if not os.path.exists(defaults):
            return False

        self.defaults = defaults
        return True

    def get_config(self, config_text=None):

        config = []

        if self.torrc:
            with open(self.torrc) as file:
                lines = file.readlines()

            for line in lines:
                line.lstrip()
                if len(line) and line[0] != '#':
                    param = line.split(' ')[0]
                    if param not in config:
                        config.append(param)

        if self.defaults:
            with open(self.defaults) as file:
                lines = file.readlines()

            for line in lines:
                line.lstrip()
                if len(line) and line[0] != '#':
                    param = line.split(' ')[0]
                    if param not in config:
                        config.append(param)

        if config_text:
            lines = config_text.splitlines()

            for line in lines:
                line.lstrip()
                if len(line) and line[0] != '#':
                    param = line.split(' ')[0]
                    if param not in config:
                        config.append(param)

        return config