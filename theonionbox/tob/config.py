import os
import tob.system


def out(msg, indent = 0, end='......'):
    print("{}{}".format('  ' * indent, msg), end=end)

def result(msg):
    print(msg)


class Configurator(object):

    def run(self, system):

        out('Configuration process initiated:', end='\n')

        self._system = system
        indent = 1


        ###
        out('Accessing your Tor configuration file (torrc) to get the ControlPort setting:', indent, end='\n')
        indent += 1

        tor_controlport = None
        torrc_path = None

        for tp in self._system.get_torrc_path():
            out("Checking if file '{}' exists".format(tp), indent=indent)
            if os.path.exists(tp):
                torrc_path = tp
                result('found!')
                break
            else:
                result('not found.')
        indent -= 1

        ###
        if torrc_path is not None:

            out("Trying to get the ControlPort setting from your torrc", indent=indent)
            tor_controlport = None

            with open(torrc_path, 'r') as f:
                lines = f.readlines()
                for line in lines:
                    l = line.lstrip()
                    if l[0] == '#':
                        continue
                    tok = l.split()
                    if len(tok) < 2:
                        continue
                    if tok[0].lower() != 'controlport':
                        continue
                    try:
                        tor_controlport = int(tok[1])
                        result('found: {}'.format(tor_controlport))
                        break
                    except:
                        continue

            if tor_controlport is None:
                result('not found.')

            indent -= 1


        if tor_controlport is None:
            out('Assuming standard ControlPort: 9051', end='\n', indent=indent)
