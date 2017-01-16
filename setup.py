from setuptools import setup, find_packages
# from distutils.core import setup

setup(
        name='theonionbox',
        version='0.0.1.dev3',
        packages=['theonionbox'],
#         package_dir={'theonionbox': 'theonionbox'},
#         package_data={'theonionbox': ['config/theonionbox.cfg',
#                                       'pages/*.html',
#                                       'css/*.css',
#                                       'scripts/*.js']},
#        packages=find_packages(),
        include_package_data=True,
#         zip_safe=False,
        url='https://github.com/ralphwetzel/theonionbox',
        license='MIT',
        author='Ralph Wetzel',
        author_email='theonionbox@gmx.com',
        description='Web Interface for TOR relay',
        install_requires=[
            'psutil',
            'configparser',
            'stem',
            'bottle>=0.12.8',
        ]
)
