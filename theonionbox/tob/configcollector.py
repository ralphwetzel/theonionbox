# from stem.control import BaseController
from manpage import ManPage


class ConfigCollector(object):

    def __init__(self, controller):
        self.tor = controller

    def collect_configs_used(self):

        configs_used = {}

        # Any configuration parameter that Tor would write to the torrc has to be considered
        # as a parameter 'used' ...
        # ... even if it might set a value equal to the default value
        # Exception: We remove settings for 'HiddenService...' in the next section. These are to be handled special!
        config_text = self.tor.get_info('config-text')

        lines = config_text.splitlines()

        for line in lines:
            line.lstrip()
            if len(line) and line[0] != '#':
                param = line.split(' ')[0]
                if param not in configs_used:
                    configs_used[param] = []

        # Now we get all the parameters Tor knows about
        # ... and their value type
        config_names = self.tor.get_info('config/names')
        names_with_values = config_names.splitlines()
        config_params = {}
        conf_map = []
        for line in names_with_values:
            config = line.split(' ')
            c0 = config[0]
            if config[1] in ['Dependant', 'Virtual']:   # special handling for HiddenServiceOptions!
                # remove these from the resulting dict!
                if c0 in configs_used:
                    del configs_used[c0]
                continue
            config_params[c0] = config[1]
            conf_map.append(c0)

        #print(conf_map)

        # Finally we get the default values for all parameters
        # ... that have a default value!
        defopt = {}
        tgi = self.tor.get_info('config/defaults')
        di = tgi.splitlines()

        for line in di:
            line = line[:-1]  # skip '"' @ end of line
            param, default = line.split('"')

            param = param[:-1]
            if param not in defopt:
                defopt[param] = [default]
            else:
                defopt[param].append(default)

        # Now get the current settings of all parameters
        # ... that we have gathered before
        tcm = self.tor.get_conf_map(conf_map, None, True)

        # print(tcm)

        # running through all the parameters
        for option in conf_map:

            # Tor does return default values for those, but not the current settings!
            no_data_from_tor = ['DirAuthority', 'FallbackDir']
            if option in no_data_from_tor:
                continue

            try:
                tgi = tcm[option]
            except:
                continue

            # If this parameter is already in the resulting dict
            # just update the value and continue.
            # This is to ensure that the 'torrc' values are always in the resulting dict.
            if option in configs_used:
                configs_used[option] = tgi
                continue

            # Manual check for equality of current setting and default value
            # This is necessary as their respective format is DIFFERENT!
            # Only the wise guys and girls developing Tor know why this is necessary!
            default = None
            if option in defopt:
                default = defopt[option]

            if tgi is None and default is None:
                continue

            if tgi == default:
                continue

            if tgi is None and default == ['']:
                continue

            # if default is None:
            #     print('{}: {}'.format(option, tgi))
                # print(option)

            cpo = config_params[option]

            if cpo == 'Float':
                _tgi = float(tgi[0]) if tgi[0] is not None else 0
                _default = float(default[0]) if default[0] is not None else 0
                if _tgi == _default:
                    continue

            elif cpo == 'Boolean':
                if (default is not None) and (tgi[0] == default[0]):
                    continue

            elif cpo in ['TimeInterval', 'TimeMsecInterval']:
                deflt = default[0].split()
                factor = 1000 if cpo == 'TimeMsecInterval' else 1
                if deflt[1] in ['second', 'seconds']:
                    factor *= 1
                elif deflt[1] in ['minute', 'minutes']:
                    factor *= 60
                elif deflt[1] in ['hour', 'hours']:
                    factor *= 3600
                elif deflt[1] in ['day', 'days']:
                    factor *= 3600 * 24
                elif deflt[1] == 'msec':
                    factor = 1  # only applicable for TimeMsecInterval

                if int(tgi[0]) == int(deflt[0]) * factor:
                    continue

            elif cpo == 'DataSize':
                deflt = default[0].split()
                factor = 1
                if len(deflt) == 2:
                    if deflt[1] == 'bytes':
                        factor = 1
                    elif deflt[1] == 'KB':
                        factor = 1024
                    elif deflt[1] == 'MB':
                        factor = 1048576
                    elif deflt[1] == 'GB':
                        factor = 1073741824

                try:
                    if int(tgi[0]) == int(deflt[0]) * factor:
                        continue
                except:
                    print(tgi, deflt, factor)
                    tgi = 'Error!'

            elif cpo == 'TimeIntervalCommaList':
                _default = default[0].replace(' ', '')
                _tgi = tgi[0].replace(' ', '')
                if _tgi == _default:
                    continue

            # print('{}: {} ({}) / {}'.format(option, tgi, default, cpo))

            # result is a dict {option_name: [list of parameters]}
            configs_used[option] = tgi

        # print(configs_used)

        return configs_used
