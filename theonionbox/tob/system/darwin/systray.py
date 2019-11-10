import threading
import signal

import AppKit
import PyObjCTools.MachSignals

from pystray._darwin import Icon as pystray_Icon, IconDelegate


class Icon(pystray_Icon):

    def _run(self):
        # Make sure there is an NSApplication instance
        self._app = AppKit.NSApplication.sharedApplication()

        # Make sure we have a delegate to handle the acttion events
        self._delegate = IconDelegate.alloc().init()
        self._delegate.icon = self

        self._status_bar = AppKit.NSStatusBar.systemStatusBar()
        self._status_item = self._status_bar.statusItemWithLength_(
            AppKit.NSVariableStatusItemLength)

        self._status_item.button().setTarget_(self._delegate)
        self._status_item.button().setAction_(self._ACTION_SELECTOR)

        # Notify the setup callback
        self._mark_ready()

        def sigint(*args):
            self.stop()
            if previous_sigint:
                previous_sigint(*args)

        # Make sure that we do not inhibit ctrl+c
        previous_sigint = PyObjCTools.MachSignals.signal(signal.SIGINT, sigint)

        try:
            self._app.run()
        except:
            self._log.error(
                'An error occurred in the main loop', exc_info=True)
        finally:
            if PyObjCTools.MachSignals.getsignal(signal.SIGINT) == sigint:
                PyObjCTools.MachSignals.signal(signal.SIGINT, previous_sigint)
            self._status_bar.removeStatusItem_(self._status_item)

    def _stop(self):
        if self.shutdown is not None:
            self.shutdown()
        super()._stop()

    def run(self, setup=None, shutdown=None):
        self.shutdown = shutdown
        super().run(setup)
