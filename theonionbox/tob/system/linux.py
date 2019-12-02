from typing import Optional

from datetime import datetime
import os
import re
import subprocess
import time


from . import BaseSystem


class Linux(BaseSystem):

    def __init__(self):
        super(Linux, self).__init__()
        self.__ntp = None
        self.__uptime = None

    @property
    def system(self):
        return 'Linux'

    @property
    def temperature(self) -> Optional[float]:
        try:
            with open('/sys/class/thermal/thermal_zone0/temp') as t:
                temp = float(t.read()) / 1000.0
            return temp
        except Exception:
            return None

    @property
    def uptime(self) -> Optional[str]:

        if self.__uptime is None:

            try:
                with open('/proc/uptime', 'r') as f:
                    up_sec = float(f.readline().split()[0])
                self.__uptime = datetime.fromtimestamp(time.time() - up_sec).strftime('%Y-%m-%d %H:%M:%S')

            except Exception:
                pass

        return self.__uptime

    @property
    def ntp(self) -> Optional[str]:

        if self.__ntp is None:

            # find potential interfaces
            try:
                ip_link = subprocess.check_output(['ip', 'link', 'show'])
                ip_link = ip_link.decode("utf-8")

                # 1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
                #     link/loopback ... brd 00:00:00:00:00:00
                # 2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP mode DEFAULT group default qlen 1000
                #     link/ether ... brd ff:ff:ff:ff:ff:ff
                # 3: wlan0: <BROADCAST,MULTICAST> mtu 1500 qdisc pfifo_fast state DOWN mode DORMANT group default qlen 1000
                #     link/ether ... brd ff:ff:ff:ff:ff:ff

                regex = r'(?:\d+: )(.+)(?::)'
                interfaces = re.findall(regex, ip_link)
            except subprocess.CalledProcessError:
                try:
                    ifconfig = subprocess.check_output(['ifconfig', '-a'])
                    ifconfig = ifconfig.decode("utf-8")

                    # eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
                    #         inet 192.168.178.28  netmask 255.255.255.0  broadcast 192.168.178.255
                    #         ...
                    #
                    # lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
                    #         inet 127.0.0.1  netmask 255.0.0.0
                    #         ...
                    #
                    # wlan0: flags=4098<BROADCAST,MULTICAST>  mtu 1500
                    #         ...

                    regex = r'(^.+)(?:: flags=)'
                    interfaces = re.findall(regex, ifconfig)
                except subprocess.CalledProcessError:
                    return None

            # check if there's lease information for those interfaces
            for interface in interfaces:

                try:
                    lease = subprocess.check_output(['dhcpcd', '--dumplease', interface, '-4'],
                                                    stderr=subprocess.STDOUT)
                    lease = lease.decode("utf-8")

                    # broadcast_address='192.168.178.255'
                    # dhcp_lease_time='864000'
                    # dhcp_message_type='5'
                    # dhcp_rebinding_time='756000'
                    # dhcp_renewal_time='432000'
                    # dhcp_server_identifier='192.168.178.1'
                    # domain_name='...'
                    # domain_name_servers='192.168.178.1'
                    # ip_address='192.168.178.xx'
                    # network_number='192.168.178.0'
                    # ntp_servers='192.168.178.1', '192.168.178.2'       <====
                    # routers='192.168.178.1'
                    # subnet_cidr='24'
                    # subnet_mask='255.255.255.0'

                    regex = r"ntp_servers=((?:'\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}',? ?)+)"
                    ntp_servers = re.findall(regex, lease)

                    # '192.168.178.1', '192.168.178.2'

                    if len(ntp_servers) > 0:
                        regex = "(?:')(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})(?:',? ?)"
                        ntps = re.findall(regex, ntp_servers[0])

                        if len(ntps) > 0:
                            self.__ntp = ntps[0]
                            break

                except Exception:
                    continue

        return self.__ntp