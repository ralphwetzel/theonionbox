from __future__ import absolute_import
import logging
import sys

from manpage import ManPage

# file based special message filtering
from tob.log import getGlobalFilter
# getGlobalFilter().set_level_for_file(__file__, 'TRACE')

#####
# Python version detection
py = sys.version_info
py37 = py >= (3, 7, 0)

# Raymond Hettinger @
# https://stackoverflow.com/questions/7961363/removing-duplicates-in-lists?page=1&tab=votes#tab-top
if py37:
    _ordered_dict = dict
else:
    from collections import OrderedDict
    _ordered_dict = OrderedDict

class ConfigCollector(object):

    def __init__(self, controller):
        self.tor = controller

    def collect_configs_used(self):

        log = logging.getLogger('theonionbox')

        configs_used = {}

        # Any configuration parameter that Tor would write to the torrc has to be considered
        # as a parameter 'used' ...
        # ... even if it might set a value equal to the default value
        # Exception: We remove settings for 'HiddenService...' in the next section. These are to be handled special!
        config_text = self.tor.get_info('config-text')

        lines = config_text.splitlines()

        for line in lines:
            log.trace(line)
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
            log.trace(config)
            c0 = config[0]
            c1 = config[1]

            # if config[1] in ['Dependent', 'Virtual']:   # special handling for HiddenServiceOptions!

            # There was a changed merged for Tor 0.3.0.x ...
            # https://trac.torproject.org/projects/tor/ticket/20956
            # ... that changed the type for all the "...Port"'s to "Dependent", and the summary to "Virtual"
            # Until this is fixed, we need a bit more effort to correct the settings

            # ATT: Similar logic added to 'config.html'

            if c0[:6] == 'Hidden': # special handling for HiddenServiceOptions!
                if c1 in ['Dependent', 'Dependant', 'Virtual']:
                    # remove these from the resulting dict!
                    if c0 in configs_used:
                        del configs_used[c0]
                    continue

            elif 'Port' in c0:
                if c1 in ['Dependent', 'Dependant', 'Virtual']:  # special handling for ...Port's !
                    c1 = 'LineList'

            config_params[c0] = c1
            conf_map.append(c0)

        log.trace(conf_map)

        # Finally we get the default values for all parameters
        # ... that have a default value!
        defopt = {}
        tgi = self.tor.get_info('config/defaults')
        di = tgi.splitlines()

        for line in di:
            log.trace(line)
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

        log.trace(tcm)

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

            cpo = config_params[option]
            # if cpo in ['LineList', 'TimeIntervalCommaList', 'RouterList', 'CommaList']:
            #     log.trace('{}|{}: {} {}'.format(option, cpo, type(tgi), tgi))

            # If this parameter is already in the resulting dict
            # just update the value and continue.
            # This is to ensure that the 'torrc' values are always in the resulting dict.
            if option in configs_used:
                configs_used[option] = self.format_data(option, cpo, tgi)
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

            # result is a dict {option_name: [list of parameters]}
            configs_used[option] = self.format_data(option, cpo, tgi)

        return configs_used

    def format_data(self, option, data_type, data):

        # LineList = Array of Comma separated list of items
        log = logging.getLogger('theonionbox')
        log.trace('{}|{}: {} {}'.format(option, data_type, type(data), data))

        # to eliminate duplicates:
        if 'List' in data_type:
            # Raymond Hettinger @
            # https://stackoverflow.com/questions/7961363/removing-duplicates-in-lists?page=1&tab=votes#tab-top
            data = list(_ordered_dict.fromkeys(data))

        if data_type in ['LineList', 'RouterList']:

            if data is not None and len(data) > 0:
                out = []
                for line in data:
                    new_line = [item.strip() for item in line.split(',')]
                    out.append(", ".join(new_line))
                data = out

        return data
