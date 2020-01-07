#!/usr/bin/env python
import os
import pathlib
import site
import sys


def main():

    if __name__ == '__main__' and __package__ in ['', None]:

        # Being __main__, we need to add the current dir to the site-dirs, to allow ABSOLUTE import
        # We resolve this Path, as __file__ might be relative, if __name__ == __main__.
        cp = pathlib.Path(__file__).resolve()
        cp = cp.parent
        assert cp.exists()

        # Add the current dir to the site-dirs, to allow ABSOLUTE import
        site.addsitedir(cp)
        from theonionbox import main as onion_main
    else:
        # we're in a package => RELATIVE should work.
        from .theonionbox import main as onion_main

    # The scripting part of theonionbox is being executed as we 'import'.
    # Now we launch the server:
    onion_main()


if __name__ == '__main__':
    main()
