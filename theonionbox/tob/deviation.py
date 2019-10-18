# from __future__ import absolute_import

from socket import AF_INET, SOCK_DGRAM
import struct
from time import time
import socket


# class TimeManager(object):
#
#     time_deviation = 0
#     ntp_server = None
#
#     def __init__(self, ntp_server=None):
#
#         if ntp_server is not None:
#             self.ntp_server = ntp_server
#
#     #    self.update_time_deviation()
#
#     def update_time_deviation(self):
#
#         # This is *based* on an excellent snipplet from Matt Crampton
#         # http://blog.mattcrampton.com/post/88291892461/query-an-ntp-server-from-python
#
#         if self.ntp_server is None:
#             return 0
#
#         port = 123
#         buffer = 1024
#         address = (self.ntp_server, port)
#         msg = '\x1b' + 47 * '\0'
#
#         # reference time (in seconds since 1900-01-01 00:00:00)
#         time1970 = 2208988800   # 1970-01-01 00:00:00
#         ntp_time = 0
#
#         try:
#             # connect to server
#             client = socket.socket(AF_INET, SOCK_DGRAM)
#         except:
#             return False
#
#         try:
#             client.settimeout(10)
#             # client.sendto(msg, address)
#             client.sendto(msg.encode('utf-8'), address)
#             msg, address = client.recvfrom(buffer)
#         except:
#             return False
#         finally:
#             client.close()
#
#         ntp_time = struct.unpack("!12I", msg)[10]
#         ntp_time -= time1970
#
#         # return the amount of seconds we've adjusted "the clock"
#         old_dev = self.time_deviation
#         self.time_deviation = time() - ntp_time
#
#         # to smoothen neglectible deviations
#         if -1 < self.time_deviation < 1:
#             self.time_deviation = 0
#
#         return old_dev - self.time_deviation
#
#     def __call__(self, time_to_compensate=None):
#         if time_to_compensate:
#             return time_to_compensate - self.time_deviation
#         else:
#             return time() - self.time_deviation
#
#     def get_deviation(self):
#         return self.time_deviation
#
#     def from_utc(self, utc_time):
#         pass


class Timer:

    time_deviation = 0
    ntp = None

    def __init__(self, ntp_server=None):

        self.ntp = ntp_server

    #    self.update_time_deviation()

    def update_time_deviation(self):

        if self.ntp is None:
            return False

        # This is *based* on an excellent snipplet from Matt Crampton
        # http://blog.mattcrampton.com/post/88291892461/query-an-ntp-server-from-python

        port = 123
        buffer = 1024
        address = (self.ntp, port)
        msg = '\x1b' + 47 * '\0'

        # reference time (in seconds since 1900-01-01 00:00:00)
        time1970 = 2208988800   # 1970-01-01 00:00:00
        ntp_time = 0

        try:
            # connect to server
            client = socket.socket(AF_INET, SOCK_DGRAM)
        except:
            return False

        try:
            client.settimeout(10)
            # client.sendto(msg, address)
            client.sendto(msg.encode('utf-8'), address)
            msg, address = client.recvfrom(buffer)
        except:
            return False
        finally:
            client.close()

        ntp_time = struct.unpack("!12I", msg)[10]
        ntp_time -= time1970

        # return the amount of seconds we've adjusted "the clock"
        old_dev = self.time_deviation
        self.time_deviation = time() - ntp_time

        # to smoothen neglectible deviations
        if -1 < self.time_deviation < 1:
            self.time_deviation = 0

        return old_dev - self.time_deviation

    def __call__(self, time_to_compensate=None):
        return self.compensate(time_to_compensate)

    def compensate(self, time_to_compensate=None):
        if time_to_compensate:
            return time_to_compensate - self.time_deviation
        else:
            return time() - self.time_deviation

    def time(self):
        return self.compensate()

    def get_deviation(self):
        return self.time_deviation

    # def from_utc(self, utc_time):
    #     pass

    # @property
    # def ntp_server(self):
    #     return self.ntp
    #
    # @ntp_server.setter
    # def ntp_server(self, ntp_server):
    #     self.ntp = ntp_server

#
# class Manager:
#
#     def __init__(self, ntp_server):
#         self.timer = Timer(ntp_server)
#
#     def getTimer(self):
#         return self.timer


__timer__ = Timer()


def getTimer(ntp_server=None):

    global __timer__

    if ntp_server is not None:
        __timer__ = Timer(ntp_server)

    return __timer__


