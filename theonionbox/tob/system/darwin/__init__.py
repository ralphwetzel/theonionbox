from typing import Optional, Callable

from datetime import datetime, timedelta
import logging
import re
import subprocess
import time


from .. import BaseSystem
from .systray import Icon


class Darwin(BaseSystem):

    temp_function = None

    def __init__(self):

        super(Darwin, self).__init__()
        self.__ntp = None
        self.__uptime = None

    @property
    def system(self):
        return 'Darwin'

    @property
    def temperature(self) -> Optional[float]:

        if self.temp_function is None:
            try:
                from .osxtemp import Temperature, Sensors, Units
                self.temp_function = Temperature(Sensors.CPU_0_PROXIMITY, Units.CELSIUS)
            except OSError:
                log = logging.getLogger('theonionbox')
                log.debug('macOSX SMC access library not found. Please check README for further instructions.')

        if self.temp_function is not None:
            try:
                return float(self.temp_function())
            except:
                pass

        return None


    @property
    def uptime(self) -> Optional[str]:

        if self.__uptime is None:

            try:
                uptime = subprocess.check_output('uptime', shell=True)
                uptime = uptime.decode("utf-8")

                # uptime return format is ... complex!

                # 17:35  up  5:10, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  14 mins, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  1 min, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  7 days, 5:10, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  7 days, 14 mins, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  7 days, 1 min, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  17 days, 5:10, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  17 days, 14 mins, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  17 days, 1 min, 1 user, load averages: 4.03 2.47 1.97
                # 17:35  up  1 day, 5:10, 1 user, load averages: 4.03 2.47 1.97

                uptime = re.findall('(\d+:\d+)(?: {1,2}up {1,2})(?:(\d+)(?: days?, ))?(?:(\d+:\d+)|(?:(\d+)(?: mins?))),', uptime)

                # we just expect one match!
                if len(uptime) == 1:
                    uptime = uptime[0]

            except Exception as exc:
                pass

            else:

                # Uptime RegEx tuple: (Timestamp, Days, hours:mins, mins)
                # hours:mins and mins are mutually exclusive!
                if len(uptime) == 4:

                    (ts, days, hours, mins) = uptime

                    if hours != '':
                        hours = hours.split(':')
                        mins = hours[1]
                        hours = hours[0]

                    days = days or '0'
                    hours = ('00{}'.format(hours))[-2:]
                    mins = ('00{}'.format(mins))[-2:]

                    its_now = datetime.fromtimestamp(time.time())
                    upt_diff = timedelta(days=int(days),
                                         hours=int(hours),
                                         minutes=int(mins))
                    upt = its_now - upt_diff

                    self.__uptime = upt.strftime('%Y-%m-%d %H:%M')

        return self.__uptime

    @property
    def ntp(self) -> Optional[str]:

        if self.__ntp is None:

            # find potential interfaces
            try:
                networksetup = subprocess.check_output(['networksetup', '-listallhardwareports'])
                networksetup = networksetup.decode("utf-8")

                # Hardware Port: Wi-Fi
                # Device: en0
                # Ethernet Address: ...
                #
                # Hardware Port: Bluetooth PAN
                # Device: en6
                # Ethernet Address: ...
                #
                # Hardware Port: Thunderbolt 1
                # Device: en3
                # Ethernet Address: ...
                #
                # ...

                regex = r'Device: (.+)'
                interfaces = re.findall(regex, networksetup)
            except subprocess.CalledProcessError:
                return None

            # check if there's lease information for those interfaces
            for interface in interfaces:

                try:
                    ipconfig = subprocess.check_output(['ipconfig', 'getpacket', interface])
                    ipconfig = ipconfig.decode("utf-8")

                    # op = BOOTREPLY
                    # htype = 1
                    # flags = 0
                    # hlen = 6
                    # hops = 0
                    # xid = ...
                    # secs = 2
                    # ciaddr = 0.0.0.0
                    # yiaddr = 192.168.178.xx
                    # siaddr = 192.168.178.1
                    # giaddr = 0.0.0.0
                    # chaddr = ...
                    # sname =
                    # file =
                    # options:
                    # Options count is 12
                    # dhcp_message_type (uint8): ACK 0x5
                    # server_identifier (ip): 192.168.178.1
                    # lease_time (uint32): 0x112380
                    # renewal_t1_time_value (uint32): 0x891c0
                    # rebinding_t2_time_value (uint32): 0xeff10
                    # subnet_mask (ip): 255.255.255.0
                    # router (ip_mult): {192.168.178.1}
                    # domain_name_server (ip_mult): {192.168.178.1}
                    # domain_name (string): ...
                    # broadcast_address (ip): 192.168.178.255
                    # network_time_protocol_servers (ip_mult): {192.168.178.1, 192.168.178.2}      <===
                    # end (none):

                    regex = r"network_time_protocol_servers \(ip_mult\): \{((?:\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3},? ?)+)\}"
                    ntp_servers = re.findall(regex, ipconfig)

                    # 192.168.178.1, 192.168.178.2

                    if len(ntp_servers) > 0:
                        regex = r"(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})(?:,? ?)"
                        ntps = re.findall(regex, ntp_servers[0])

                        if len(ntps) > 0:
                            self.__ntp = ntps[0]
                            break

                except Exception:
                    continue

        return self.__ntp

    def run_with_icon(self, launch, shutdown):

        from . import Icon
        import pystray
        from functools import partial
        import os

        def on_openBox(icon, item, self):
            os.system(f"open /Applications/Safari.app {self.url}")

        menu = pystray.Menu(
            pystray.MenuItem('Show TheOnionBox...', partial(on_openBox, self=self))
        )

        icon = Icon('The Onion Box', menu=menu)
        from PIL import Image, ImageDraw

        def create_image():
            # Generate an image and draw a pattern
            width = 41
            height = 41
            color1 = 0x000000
            color2 = 0xffffff

            image = Image.new('RGB', (width, height), color1)
            dc = ImageDraw.Draw(image)
            dc.rectangle(
                (width // 2, 0, width, height // 2),
                fill=color2)
            dc.rectangle(
                (0, height // 2, width // 2, height),
                fill=color2)

            return image

        icon.icon = create_image()

        # Prevent app from showing up in the dock
        # https://stackoverflow.com/questions/4345102/how-to-hide-application-icon-from-mac-os-x-dock
        from AppKit import NSBundle
        bundle = NSBundle.mainBundle()
        info = bundle.localizedInfoDictionary() or bundle.infoDictionary()
        info['LSUIElement'] = '1'

        def run_call(icon):
            if icon is not None:
                icon.visible = True
            launch()

        icon.run(run_call, shutdown)
