#!/usr/bin/env python
from __future__ import absolute_import
import sys, os


def main():

    # the import executes the scripting part...
    if __name__ == '__main__':
        # we can't use relative imports here!!
        # get an absolute path to the directory that contains mypackage
        this_dir = os.path.dirname(os.path.join(os.getcwd(), __file__))
        sys.path.append(os.path.normpath(os.path.join(this_dir, '..')))

        from theonionbox import main as onion_main

    else:
        from .theonionbox import main as onion_main

    # ... and main() launches the server!
    onion_main()


if __name__ == '__main__':

    args = sys.argv[1:]
    main()


