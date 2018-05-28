from setuptools import setup
import os
import sys
import fnmatch
import setuptools.command.build_ext
import setuptools.command.sdist
import setuptools.command.install
from theonionbox.stamp import __version__, __description__

from distutils.extension import Extension

# Custom command to compile the latest README.html
# BTW: grip is quite cool!
def CompileREADME():

    # https://stackoverflow.com/questions/3431825/generating-an-md5-checksum-of-a-file
    def get_hash(filename):

        import hashlib

        def hash_bytestr_iter(bytesiter, hasher, ashexstr=False):
            for block in bytesiter:
                hasher.update(block)
            return (hasher.hexdigest() if ashexstr else hasher.digest())

        def file_as_blockiter(afile, blocksize=65536):
            with afile:
                block = afile.read(blocksize)
                while len(block) > 0:
                    yield block
                    block = afile.read(blocksize)

        return hash_bytestr_iter(file_as_blockiter(open(filename, 'rb')), hashlib.sha256(), True)

    # tor.1.txt production
    try:
        from xtor import TorTxt
        tt = TorTxt(force=False)
        if tt.run() is True:
            tt.copy(os.path.join('theonionbox','tor'))
    except:
        pass

    old_md_hash = ''
    old_html_hash = ''
    old_rst_hash = ''

    current_md_hash = 'doit'
    current_html_hash = 'doit'
    current_rst_hash = 'doit'

    try:
        with open('readme/README.hash', 'r') as f:
            lines = f.readlines()
            if len(lines) == 3:
                old_md_hash = lines[0].strip()
                old_html_hash = lines[1].strip()
                old_rst_hash = lines[2].strip()
    except Exception as e:
        # raise e
        pass

    try:
        current_md_hash = get_hash('README.md')
        current_html_hash = get_hash('readme/README.html')
        current_rst_hash = get_hash('readme/README.rst')
    except Exception as e:
        # raise e
        pass

    hash_changed = False

    if (old_md_hash != current_md_hash) or (old_html_hash != current_html_hash):
        from grip import export
        export(path='README.md', out_filename='readme/README.html', title='The Onion Box v{}'.format(__version__))
        hash_changed = True
    else:
        print('Skiping generation of README.html; files unchanged!')

    do_rst = False
    if do_rst is True:
        if (old_md_hash != current_md_hash) or (old_rst_hash != current_rst_hash):
            # path defined by: brew install pandoc
            # os.environ.setdefault('PYPANDOC_PANDOC', '/usr/local/Cellar/pandoc/2.1')
            from pypandoc import convert_file
            print('Generating README.rst')
            convert_file('README.md', 'rst', outputfile="readme/README.rst")
            hash_changed = True
        else:
            print('Skiping generation of README.rst; files unchanged!')
    else:
        print('Generation of README.rst intentionally deactivated!')

    if hash_changed is True:
        with open('readme/README.hash', 'w') as f:
            f.write(current_md_hash+'\n'+current_html_hash+'\n'+current_rst_hash)


# class PostInstallCommand(setuptools.command.install.install):
#
#     def run(self):
#         import os
#         # start with standard staff...
#         setuptools.command.install.install.run(self)
#
#         # post install activities
#         # http://stackoverflow.com/a/1883251/1286571
#         import sys
#         if hasattr(sys, 'real_prefix'):
#             os.chmod('theonionbox/theonionbox/run.sh', int('755', 8))
#         else:
#             print("No real_prefix")


# def CompileOSXTemp():
#
#     from subprocess import call
#     from Cython.Build import cythonize
#     from setuptools.extension import Extension
#
#     osxtemp_path = 'support/osxtemp'
#     libsmc_path = os.path.join(osxtemp_path, 'libsmc')
#
#     libsmc_clean = ['make',
#                     '--directory={}'.format(libsmc_path),
#                     'clean']
#
#     libsmc_cmd = ['make',
#                   '--directory={}'.format(libsmc_path),
#                   'dynamic']
#
#     print("Compiling '{}'".format(libsmc_path))
#     # call(libsmc_clean)
#     call(libsmc_cmd)
#
#     pth = os.path.join(osxtemp_path, '*.pyx')
#     osxt = cythonize(pth, force=True)
#
#     print(osxt)
#     pass
#     pass


# Linking custom command into the sdist chain
# https://seasonofcode.com/posts/how-to-add-custom-build-steps-and-commands-to-setuppy.html
class sdist(setuptools.command.sdist.sdist):

    def run(self):

        def emptydir(top):
            if top == '/' or top == "\\":
                return
            else:
                for root, dirs, files in os.walk(top, topdown=False):
                    for name in files:
                        os.remove(os.path.join(root, name))
                    for name in dirs:
                        os.rmdir(os.path.join(root, name))

        try:
            print("Clearing ./dist ...")
            emptydir('dist')
        except:
            print('Removing ./dist FAILED!')


        try:
            print("Clearing ./theonionbox.egg-info ...")
            emptydir('theonionbox.egg-info')
        except:
            print('Removing ./theonionbox.egg-info FAILED!')

        # CompileOSXTemp()
        CompileREADME()

        # continue with standard staff...
        setuptools.command.sdist.sdist.run(self)


def generate_package_data(package_data, exclude=None, package_dir=None):
    """
    :param package_data: package_data as expected by setup.py, recursive dir wildcards
    :type package_data: dict
    :param package_dir: package_dir as expected by setup.py
    :type package_dir: dict
    :return: package_data as expected by setup.py, recursive directories expanded
    :rtype: dict
    """

    out = {}

    package_dir = package_dir or {}

    for key, paths in package_data.items():
        out_path = []

        base_path = package_dir[key] if key in package_dir else ''
        exclude_paths = exclude[key] if key in exclude else []

        for path_item in paths:
            root = os.path.join(base_path, path_item)

            if os.path.isfile(root):
                out_path.append(path_item)
                continue

            root_dir, root_file = os.path.split(root)

            for (dirpath, dirnames, filenames) in os.walk(root_dir):
                relpath = os.path.relpath(os.path.join(dirpath, root_file), base_path)
                if relpath not in exclude_paths:
                    out_path.append(relpath)

        out[key] = out_path

    return out


def generate_data_files(data_files):
    """
    :param data_files: data_files as expected by setup.py, recursive dir wildcards
    :type package_data: list
    :return: data_files as expected by setup.py, recursive files expanded
    :rtype: list
    """

    out = {}

    for target, sources in data_files:

        if target not in out:
            out[target] = []

        for source in sources:

            if os.path.isfile(source):
                out[target].append(source)
                continue

            source_dir, source_match = os.path.split(source)

            for (dirpath, dirnames, filenames) in os.walk(source_dir):
                    for file in filenames:
                        if fnmatch.fnmatch(file, source_match):
                            file_rel_target = os.path.relpath(dirpath, source_dir)
                            file_target = os.path.join(target, file_rel_target)

                            if file_target not in out:
                                out[file_target] = []

                            out[file_target].append(os.path.join(dirpath, file))

    retval = []
    for key, items in out.items():
        retval.append((key, items))

    return retval


packages = [
    'theonionbox',
    'theonionbox.tob',
    'theonionbox.tob.external',
    'theonionbox.tob.livedata',
    'theonionbox.tob.osxtemp',
    # 'theonionbox.tob.external.tzlocal'
]

package_dir = {
    'theonionbox': 'theonionbox',
    'theonionbox.tob': 'theonionbox/tob',
    'theonionbox.tob.external': 'theonionbox/tob/external',
    'theonionbox.tob.livedata': 'theonionbox/tob/livedata',
    'theonionbox.tob.osxtemp': 'theonionbox/tob/osxtemp',
    # 'theonionbox.tob.external.tzlocal:': 'theonionbox/tob/external/tzlocal'
}

package_data = {
    'theonionbox': ['config/*',
                    'css/*',
                    'font/*',
                    'libs/*',
                    'pages/*',
                    'scripts/*',
                    'sections/*',
                    'tor/*',
                    'uptime/*',
                    ]
}

package_data_exclude = {
    'theonionbox': ['sections/controlcenter/*',
                    ]
}

data_files = [
    ('docs', ['docs/*.*']),
    ('', ['readme/README.html']),
    ('config', ['theonionbox/config/*.*']),
    ('service', []),
    ('service/FreeBSD', ['FreeBSD/theonionbox.sh']),
    ('service/init.d', ['init.d/theonionbox.sh']),
    ('service/systemd', ['systemd/theonionbox.service']),
    ('support', []),
    ('support/osxtemp', []),
    ('support/osxtemp/libsmc', ['support/osxtemp/libsmc/LICENSE', 'support/osxtemp/libsmc/Makefile']),
    ('support/osxtemp/libsmc/include', ['support/osxtemp/libsmc/include/smc.h']),
    ('support/osxtemp/libsmc/src', ['support/osxtemp/libsmc/src/smc.c']),
]
# print(generate_data_files(data_files))

# import platform
#
# def extensions(system=platform.system()):
#
#     run_cythonize = False
#     try:
#         from Cython.Build import cythonize
#         run_cythonize = True
#     except ImportError:
#         pass
#
#     ext = []
#     if system == 'Darwin' and True is False:    # disabled 20180417
#
#         # 'osxtemp'
#         path = 'support/osxtemp'
#
#         sf = '*.pyx' if run_cythonize is True else '*.c'
#         source_files = os.path.join(path, sf)
#
#         # path to the libsmc library
#         libsmc_path = os.path.join(path, 'libsmc')
#
#         ext.append(Extension(name='theonionbox.tob.osxtemp',
#                              include_dirs=[path, libsmc_path],
#                              depends=[os.path.join(libsmc_path, 'include', 'smc.h')],
#                              sources=[source_files,
#                                       os.path.join(libsmc_path, 'src', 'smc.c')]
#                              )
#                    )
#
#     if run_cythonize is True:
#         try:
#             ext = cythonize(ext)
#         except:
#             ext = []
#
#     return ext


setup(
    cmdclass={'sdist': sdist,
              },
    name='theonionbox',
    version=__version__,
    # py_modules=['theonionbox.py'],
    packages=packages,
    package_dir=package_dir,
    package_data=generate_package_data(package_data=package_data,
                                       exclude=package_data_exclude,
                                      package_dir=package_dir),
    #package_data = package_data,
    data_files=generate_data_files(data_files),
    url='https://github.com/ralphwetzel/theonionbox',
    license='MIT',
    author='Ralph Wetzel',
    author_email='theonionbox@gmx.com',
    description=__description__,
    long_description=open('docs/description.rst').read(),
    entry_points={
        'console_scripts': [
            'theonionbox = theonionbox.__main__:main']
    },
    install_requires=[
        'psutil>=5.4.0',
        'apscheduler>=2.1.2, <3.*; python_version<"3.0"',
        'apscheduler>=3.4; python_version>="3.0"',
        'requests>2.18',
        'PySocks>=1.6.7',
        'bottle>=0.12.13',
        'stem>=1.5.4',
        'tzlocal>=1.5',
        'futures>=3.2; python_version<"3.0"',
        'urllib3>=1.22'
    ],
    long_description_content_type='text/x-rst; charset=UTF-8',
    classifiers=[
        # https://pypi.python.org/pypi?%3Aaction=list_classifiers
        'Development Status :: 5 - Production/Stable',
        'Environment :: Console',
        'Environment :: Web Environment',
        'Framework :: Bottle',
        'Intended Audience :: End Users/Desktop',
        'Intended Audience :: Information Technology',
        'Intended Audience :: Science/Research',
        'Intended Audience :: System Administrators',
        'License :: OSI Approved :: MIT License',
        'Natural Language :: English',
        'Operating System :: MacOS',
        'Operating System :: Microsoft :: Windows',
        'Operating System :: POSIX :: BSD :: FreeBSD',
        'Operating System :: POSIX :: Linux',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Topic :: System :: Networking :: Monitoring',
        'Topic :: Utilities',
    ],
    platforms=['Linux', 'Windows', 'MacOS X', 'FreeBSD'],
    # ext_modules=extensions(),
)
