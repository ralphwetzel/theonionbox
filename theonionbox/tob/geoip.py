# Default class used if no geoip db present
class GeoIPOO(object):

    def country(self, ip, default=None):
        return default

    def country_name(self, ip, default=None):
        return default

    def region_name(self, ip, default=None):
        return default

    def city_name(self, ip, default=None):
        return default

    def postal_code(self, ip, default=None):
        return default

    def latitude(self, ip, default=None):
        return default

    def longitude(self, ip, default=None):
        return default

    def close(self):
        return


class GeoIP2(GeoIPOO):

    reader = None
    cache = {}

    def __init__(self, path_to_db):

        from geoip2.database import Reader

        try:
            self.reader = Reader(path_to_db)
        except:
            pass

        self.cache = {}

    def data(self, ip):
        try:
            return self.cache[ip]
        except KeyError:
            try:
                response = self.reader.city(ip)
            except:
                return None

            self.cache[ip] = response
            return response

    def country(self, ip, default=None):
        rsp = self.data(ip)
        if rsp is None:
            return default
        try:
            return rsp.country.iso_code
        except:
            return default

    def country_name(self, ip, default=None):
        rsp = self.data(ip)
        if rsp is None:
            return default
        try:
            return rsp.country.name
        except:
            return default

    def region_name(self, ip, default=None):
        rsp = self.data(ip)
        if rsp is None:
            return default
        try:
            return rsp.subdivisions.most_specific.name
        except:
            return default

    def city_name(self, ip, default=None):
        rsp = self.data(ip)
        if rsp is None:
            return default
        try:
            return rsp.city.name
        except:
            return default

    def postal_code(self, ip, default=None):
        rsp = self.data(ip)
        if rsp is None:
            return default
        try:
            return rsp.postal.code
        except:
            return default

    def latitude(self, ip, default=None):
        rsp = self.data(ip)
        if rsp is None:
            return default
        try:
            return rsp.location.latitude
        except:
            return default

    def longitude(self, ip, default=None):
        rsp = self.data(ip)
        if rsp is None:
            return default
        try:
            return rsp.location.longitude
        except:
            return default

    def close(self):
        self.reader.close()


