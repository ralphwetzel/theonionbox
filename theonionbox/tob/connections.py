class connections(object):

    def __init__(self):
        self.initialize()

    def initialize(self, status=None):
        if status is None:
            self.connections = 0
        else:
            try:
                lines = status.splitlines(keepends=False)
                self.connections = len(lines)
            except:
                return False

        return True
