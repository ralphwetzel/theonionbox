class AttributedDict(dict):

    def __getattr__(self, key):
        """ Gets key if it exists, otherwise throws AttributeError."""
        try:
            # Throws exception if not in prototype chain
            return object.__getattribute__(self, key)
        except AttributeError:
            try:
                ret = self[key]
            except KeyError:
                raise AttributeError(key)

            if isinstance(ret, dict):
                return AttributedDict(ret)
            else:
                return ret


class SettableAttributedDict(AttributedDict):

    def __setattr__(self, key, value):

        try:
            # Throws exception if not in prototype chain
            object.__getattribute__(self, key)
        except AttributeError:
            try:
                self[key] = value
            except:
                raise AttributeError(key)
        else:
            object.__setattr__(self, key, value)