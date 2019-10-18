from typing import Optional, Union
import contextlib
from configupdater import ConfigUpdater, DuplicateSectionError
from configupdater.configupdater import Section
import uuid
import time

from tob.config import DefaultNodeConfig


def validate(section: Section, file=''):

    name = section.name
    e = f"{file}[{name}]"

    try:
        control = section['control'].value
    except KeyError:
        raise ValueError(f"{e}: 'control' definition missing.")

    t = ['port', 'socket', 'proxy']
    if control not in t:
        raise ValueError(f"{e}: Invalid value for 'control'. Use any of {t}.")

    s = section.to_dict()

    host = s.get('host')
    port = s.get('port')

    e = f'{e} / control = {control}'

    if control in ['port', 'proxy'] :
        if host is None:
            raise ValueError(f"{e}: 'host' definition missing.")
        if port is None:
            raise ValueError(f"{e}: 'port' definition missing.")

    if control == 'socket':
        if host is None:
            raise ValueError(f"{e}: 'host' definition missing.")

class CCNode:

    def node_property(name, default=None, update_last_modified_flag=True):

        @property
        def prop(self):
            try:
                return self.section[name].value
            except:
                return default

        @prop.setter
        def prop(self, value):

            try:
                old = self.section[name]
            except:
                old = None

            if value != old:
                if value is not None:
                    self.section[name] = value
                else:
                    del self.section[name]

                if update_last_modified_flag is True:
                    self.file.set_section_last_modified(self.section.name)

        return prop

    label = node_property('label', None, False)
    control = node_property('control', None)
    host = node_property('host', None)
    port = node_property('port', None)
    password = node_property('password', None)
    cookie = node_property('cookie', None)

    del node_property

    def __init__(self, file: 'CCFile', section: Section):

        self.file = file
        self.section = section

    @property
    def name(self) -> str:
        return self.section.name

    # @name.setter
    # def name(self, value):
    #     self.section.name = value

    def tick(self):
        # self._last_modified = time.time()
        self.file.tick(self.last_modified)

    def move_after(self, reference: 'CCNode' = None):
        section = None if reference is None else reference.section
        self.file.move_after(self.section, section)

    @property
    def last_modified(self):
        return self.file.get_section_last_modified(self.section.name)

    @property
    def is_default_node(self) -> bool:
        return False

    def remove(self):
        self.file.set_section_last_modified(self.section.name)
        return self.file.remove_node(self.section)

    @property
    def readonly(self):
        return self.file.readonly

class CCFile:

    def __init__(self, filename):

        self.filename = filename
        self.updater = ConfigUpdater()
        self.updater.read(filename)

        for section in self.updater.sections_blocks():
            validate(section, filename)

        self._readonly = None
        self._last_modified = time.time()
        self.slm = {}

    def __iter__(self) -> CCNode:
        for section in self.updater.sections_blocks():
            yield CCNode(self, section)

    @property
    def readonly(self) -> bool:
        file = None
        try:
            file = open(self.filename, 'w')
        except:
            readonly = True
        else:
            readonly = False
        finally:
            if file is not None:
                file.close()

        return readonly

    def write(self):
        with contextlib.suppress(Exception):
            self.updater.update_file()

    def move_after(self, section: Section, reference: Section = None):

        self.updater.remove_section(section.name)
        if reference is None:
            sections = self.updater.sections()
            if len(sections) > 0:
                reference = self.updater[sections[0]]
                reference.add_before.section(section)
            else:
                self.updater.add_section(section)
        else:
            reference.add_after.section(section)

        self.tick()

    def add_node(self) -> Optional[CCNode]:
        if self.readonly is True:
            return None

        while 1:
            id = uuid.uuid4().hex
            try:
                self.updater.add_section(id)
            except DuplicateSectionError:
                continue
            except:
                return None
            else:
                break

        return CCNode(self, self.updater[id])

    def remove_node(self, section: Section) -> bool:
        if self.readonly is True:
            return False

        self.updater.remove_section(section.name)
        return True

    @property
    def last_modified(self):
        return int(self._last_modified)

    def tick(self, last_modified=None):
        self.write()
        if last_modified is None:
            last_modified = time.time()
        self._last_modified = last_modified

    def get_section_last_modified(self, id) -> int:
        return self.slm.get(id, 0)

    def set_section_last_modified(self, id, last_modified=None):
        if last_modified is None:
            last_modified = time.time()
        self.slm[id] = last_modified
