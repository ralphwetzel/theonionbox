#!/usr/bin/env python
import sys


def main():

    # the import executes the scripting part...
    import theonionbox
    # ... and main() launches the server!
    theonionbox.main()


if __name__ == "__main__":

    args = sys.argv[1:]
    main()


