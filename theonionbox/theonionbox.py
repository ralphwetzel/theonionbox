#!/usr/bin/env python
import click
import configupdater
import functools
import os
import pathlib
import re
import site
import sys

# theonionbox.py -d --config filepath box --host 0.0.0.0 --port 8080 ... tor --host 0.0.0.0 --port ... proxy --host: ...

#####
# Version & Stamping
# Yes, I know; this is a hack...
try:
    import stamp
except ModuleNotFoundError:
    from . import stamp

stamped_version = '{} (stamp {})'.format(stamp.__version__, stamp.__stamp__)

def configfile(*param_decls, **attrs):

    def _callback(callback, ctx, param, value):

        ctx.default_map = ctx.default_map or {}

        if value:

            try:
                updater = configupdater.ConfigUpdater()
                updater.read(value)
            except Exception as e:
                raise click.BadOptionUsage(param, "Error reading configuration file: {}".format(e), ctx)

            try:
                b = updater['TheOnionBox'].to_dict()
            except KeyError:
                b = {}

            try:
                t = updater['Tor'].to_dict()
            except KeyError:
                t = {}

            try:
                p = updater['TorProxy'].to_dict()
            except KeyError:
                p = {}

            cfg = {
                'box': b,
                'tor': t,
                'proxy': p
            }

            ctx.default_map.update(cfg)

        return callback(ctx, param, value) if callback else value

    def decorator(f):

        attrs['is_eager'] = True
        saved_callback = attrs.pop('callback', None)
        partial_callback = functools.partial(_callback, saved_callback)
        attrs['callback'] = partial_callback
        return click.option(*param_decls, **attrs)(f)

    return decorator


@click.group(chain=True, invoke_without_command=True)
@click.option('-d', '--debug', is_flag=True, flag_value=True,
              help='Switch on DEBUG mode.')
@click.option('-t', '--trace', is_flag=True, flag_value=True,
              help='Switch on TRACE mode (which is more verbose than DEBUG mode).')
@click.option('-l', '--log', default=None, show_default=True,
              type=click.Path(exists=True, file_okay=False, dir_okay=True, writable=True,
                              resolve_path=True, allow_dash=False),
              help='DIRECTORY to additionally emit log messages to. Please assure write privileges.')
@configfile('-c', '--config', default=None, show_default=True,
            type=click.Path(exists=True, file_okay=True, dir_okay=False, readable=True,
                            resolve_path=True, allow_dash=False),
            help='Read configuration from FILE.')
@click.option('-x', '--controlcenter', 'cc', default=None, show_default=True,
              type=click.Path(exists=True, file_okay=True, dir_okay=False, readable=True,
                              resolve_path=True, allow_dash=False),
              help='Enable control center mode; controlled host data will be read from and stored in FILE.')
@click.version_option(prog_name=f'{stamp.__title__}: {stamp.__description__}',
                      version=stamped_version, message='%(prog)s\nVersion %(version)s')
@click.pass_context
def main(ctx, debug, trace, config, cc, log):
    # The Box will be launched by launcher() ... after all the subcommands returned.
    pass


@main.resultcallback()
def launcher(results, debug, trace, config, cc, log):

    # This raises (by intension) if no context.
    ctx = click.get_current_context()

    params = {}
    for res in results:
        params.update(res)

    # Verify the parameters defined in the configuration file:
    for cmd in ['box', 'tor', 'proxy']:

        # If there was a config file, it's values have been loaded into the default_map
        dm = ctx.default_map.get(cmd, {})

        # This is a command
        func = globals()[cmd]

        # Get the interface = names of all valid parameters of our command
        func_params_name = [p.name for p in func.params]

        # Check if a parameter found in the config file...
        for d in dm:
            # ... is part of the interface:
            if d not in func_params_name:
                # If not, raise an error!
                ref = {
                    'box': 'TheOnionBox',
                    'tor': 'Tor',
                    'proxy': 'Proxy'
                }
                raise click.NoSuchOption(d, f'Invalid option in configuration file: [{ref[cmd]}] {d}')

        # After this validation,
        # we use the values found in the default_map to feed the commands that are not called via the command line
        if cmd not in params:
            # call the command with the values from the config file
            params.update(ctx.invoke(func, **dm))

    if params['proxy']['control'] == 'tor':
        transfer = ['control', 'host', 'port', 'socket']
        for item in transfer:
            params['proxy'][item] = params['tor'][item]
    else:
        check = ['host', 'port', 'socket']
        for item in check:
            if params['proxy'][item] == 'tor':
                params['proxy'][item] = params['tor'][item]

    params['debug'] = debug
    params['trace'] = trace
    params['config'] = config
    params['cc'] = cc
    params['log'] = log

    # Next We do all the stuff to prepare the environment to run a Box

    # Provide the demanded CurrentWorkingDirectory ... without truely changing to it via os.chdir !!
    # We resolve this Path, as __file__ might be relative, if __name__ == __main__.
    cwd = pathlib.Path(__file__).resolve()
    cwd = cwd.parent
    assert cwd.exists()
    params['cwd'] = cwd

    if __name__ == '__main__' or __package__ in [None, '']:
        # Add the current dir to the site-dirs, to allow ABSOLUTE import
        site.addsitedir(cwd)
        from tob.box import Box
    else:
        # we're in a package => RELATIVE should work.
        from .tob.box import Box

    tob = Box(params)
    tob.run()


@main.command('box', short_help='Options to configure your Onion Box.')
@click.option('--host', default='0.0.0.0', metavar='ADDRESS', show_default=True,
             help='IPv4 ADDRESS of your Onion Box, no PORT.')
@click.option('--port', default='8080', metavar='PORT', show_default=True,
             help='Listening PORT of your Onion Box.')
@click.option('--message_level', default='NOTICE', show_default=True,
              type=click.Choice(['DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR']),
              help='Error level verbosity.')
@click.option('--base_path', default=None, metavar='PATH', show_default=True,
             help='Base path prefix.')
#TODO: Verify documentation @ default config file: it says default is 300s! Questionable!
@click.option('--session_ttl', default='30', metavar='SECONDS', show_default=True,
             help='Duration of session validity.')
@click.option('--ssl_key', default=None, show_default=True,
              type=click.Path(exists=True, file_okay=True, dir_okay=False, readable=True, allow_dash=False),
              help='Path to key file for SSL operations.')
@click.option('--ssl_certificate', default=None, show_default=True,
              type=click.Path(exists=True, file_okay=True, dir_okay=False, readable=True, allow_dash=False),
              help='Path to certificate file for SSL operations.')
@click.option('--ntp_server', default=None, metavar='ADDRESS', show_default=True,
             help='ADDRESS of a NTP server.')
@click.option('--geoip2_city', default=None,
              type=click.Path(exists=True, file_okay=True, dir_okay=False,
                              readable=True, resolve_path=True, allow_dash=False),
              help='Path to supplemental GeoIP2 city database.')
@click.option('--persistance_dir', default=None, show_default=True,
              type=click.Path(exists=True, file_okay=False, dir_okay=True,
                              readable=True, writable=True, resolve_path=True, allow_dash=False),
              help='Path to store the database file for monitoring data persistance.')
@click.pass_context
def box(ctx, host, port, message_level, base_path, session_ttl, ssl_key, ssl_certificate, ntp_server, geoip2_city,
        persistance_dir):
    """Options to configure your Onion Box."""

    if ssl_key is not None or ssl_certificate is not None:
        try:
            import ssl
        except ImportError:
            raise click.UsageError("SSL operations demand availability of Python module 'ssl'.")

    if ssl_key is not None and ssl_certificate is None:
        raise click.BadOptionUsage(option_name='ssl_key',
                                   message="ssl_key FILE provided, but ssl_certificate FILE is missing.")

    if ssl_key is None and ssl_certificate is not None:
        raise click.BadOptionUsage(option_name='ssl_certificate',
                                   message="ssl_certificate FILE provided, but ssl_key FILE is missing.")

    if geoip2_city is not None:
        try:
            import geoip2
        except ImportError:
            raise click.BadOptionUsage(
                option_name='geoip2_city',
                message="Usage of the GeoIP2 City database demands availability of Python module 'geoip2'.")

    if base_path is None:
        base_path = ''

    return {'box': {
        'host': host,
        'port': port,
        'message_level': message_level,
        'base_path': base_path,
        'session_ttl': session_ttl,
        'ssl_key': ssl_key,
        'ssl_certificate': ssl_certificate,
        'ntp_server': ntp_server,
        'geoip2_city': geoip2_city,
        'persistance_dir': persistance_dir
    }}

@main.command('tor', short_help='Configure the connection to the Tor node to be monitored.')
@click.option('--control', default='port', show_default=True,
              type=click.Choice(['port', 'proxy', 'socket']),
              help='Mode to establish a controlling connection.')
@click.option('--host', default='127.0.0.1', metavar='ADDRESS', show_default=True,
             help='[IPv4 | URL | .onion] ADDRESS of this Tor node, no PORT.')
@click.option('--port', default='auto', metavar='PORT', show_default=True,
             help='ControlPort of this Tor node.')
@click.option('--socket', default=None, metavar='SOCKET', show_default=True,
             help='Local ControlSocket of the Tor node.')
@click.option('--auth_cookie', default=None, metavar='COOKIE', show_default=True,
             help='Cookie necessary to support HiddenServiceAuthorizeClient.')
@click.option('--password', default=None, metavar='PASSWORD', show_default=True,
              help='Password, necessary if this Tor node is guarded with a HashedControlPassword.')
@click.pass_context
def tor(ctx, control, host, port, socket, auth_cookie, password):
    """Settings to configure the connection to the Tor node to be monitored."""

    if control in ['port', 'proxy']:
        if host is None or port is None:
            raise click.BadOptionUsage(
                option_name='control',
                message=f"--control mode '{control}' requires --host and --port to be defined as well.")
    elif control == 'socket':
        if socket is None:
            raise click.BadOptionUsage(option_name='control',
                                       message="--control mode 'socket' requires --socket to be defined as well.")

    if auth_cookie is not None:
        check = re.match('^[a-zA-Z0-9+/]{22}$', auth_cookie) # see Tor(1), HidServAuth
        if check is None:
            raise click.BadParameter(param_hint='--auth_cookie',
                                     message="Parameter provided is not a Tor Authorization Cookie.")

    return {'tor': {
        'control': control,
        'host': host,
        'port': port,
        'socket': socket,
        'cookie': auth_cookie,
        'password': password,
        'label': None,      # some additional properties, demanded by the cc
        'connect': True
    }}


@main.command('proxy', short_help='Configure the connection to a Tor node acting as proxy.')
@click.option('--control', default='tor', show_default=True,
              type=click.Choice(['tor', 'port', 'socket']),
              help='Mode to establish a controlling connection.')
@click.option('--host', default=None, metavar='ADDRESS', show_default=True,
             help='[IPv4 | URL] ADDRESS of the Tor node, no PORT.')
@click.option('--port', default=None, metavar='PORT', show_default=True,
             help='ControlPort of the Tor node.')
@click.option('--socket', default=None, metavar='SOCKET', show_default=True,
             help='Local ControlSocket of the Tor node.')
@click.option('--proxy', default='auto', metavar='PORT', show_default=True,
              help='SocksPort of the Tor node.')
@click.pass_context
def proxy(ctx, control, host, port, socket, proxy):
    """Settings to configure the connection to a Tor node acting as proxy."""

    if control == 'port':
        if host is None or port is None:
            raise click.BadOptionUsage(
                option_name='control',
                message=f"--control mode '{control}' requires --host and --port to be defined as well.")
    elif control == 'socket':
        if socket is None:
            raise click.BadOptionUsage(option_name='control',
                                       message="--control mode 'socket' requires --socket to be defined as well.")

    return {'proxy': {
        'control': control,
        'host': host,
        'port': port,
        'socket': socket,
        'proxy': proxy
    }}


if __name__ == '__main__':
    main()
