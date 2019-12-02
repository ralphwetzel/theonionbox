# coding=UTF-8

from pytz.tzinfo import NonExistentTimeError, AmbiguousTimeError
from apscheduler.schedulers import SchedulerNotRunningError

# to compensate for 'No handlers could be found for logger "apscheduler.scheduler"' message
import logging
log = logging.getLogger('apscheduler.scheduler')
log.addHandler(logging.NullHandler())


#####
# Class to support APScheduler v3 (default) and v2
# despite their interfaces are incompatible!

class Scheduler(object):

    schedulr = None
    aps3 = True

    def __init__(self):

        #####
        # ApScheduler version detection
        try:
            # APScheduler 3.x implementation
            from apscheduler.schedulers.background import BackgroundScheduler
            self.schedulr = BackgroundScheduler()
            self.aps3 = True
        except ImportError:
            # APScheduler 2.x implementation
            from apscheduler.scheduler import Scheduler
            self.schedulr = Scheduler()
            self.aps3 = False

    def start(self):
        return self.schedulr.start()

    def get_job(self, name):
        if self.aps3:
            return self.schedulr.get_job(name)
        else:
            jobs = self.schedulr.get_jobs()
            for job in jobs:
                if job.name == name:
                    return job

            return None

    def add_job(self, func, trigger, args=None, kwargs=None, id=None, **trigger_args):

        s = None

        if self.aps3:
            try:
                s = self.schedulr.add_job(func, trigger, id=id,
                                           replace_existing=True, args=args, kwargs=kwargs, **trigger_args)
            except (NonExistentTimeError, AmbiguousTimeError) as err:
                # Could happen at the beginning of DST period or at the end:
                # Add one hour to jump ot of the slushy zone
                if trigger is 'date':
                    from datetime import timedelta
                    trigger_args['run_date'] += timedelta(hours=1)
                    s = self.schedulr.add_job(func, trigger, id=id,
                                              replace_existing=True, args=args, kwargs=kwargs, **trigger_args)
                else:
                    raise err

            return s

        else:
            if trigger is 'date':
                run_date = trigger_args['run_date']   # by intention: to raise if not set!
                del trigger_args['run_date']

                try:
                    s = self.schedulr.add_date_job(func, run_date, name=id, # replace_existing=True,
                                                  args=args, kwargs=kwargs)
                except (NonExistentTimeError, AmbiguousTimeError):
                    # Could happen at the beginning of DST period or at the end:
                    # Add one hour to jump ot of the slushy zone
                    from datetime import timedelta
                    run_date += timedelta(hours=1)
                    s = self.schedulr.add_date_job(func, run_date, name=id, # replace_existing=True,
                                                  args=args, kwargs=kwargs)

                return s

            elif trigger is 'interval':
                # only partially implemented!!
                seconds = 0
                minutes = 0
                hours = 0
                if 'seconds' in trigger_args:
                    seconds = trigger_args.get('seconds', 0)
                    del trigger_args['seconds']

                if 'minutes' in trigger_args:
                    minutes = trigger_args.get('minutes', 0)
                    del trigger_args['minutes']

                if 'hours' in trigger_args:
                    hours = trigger_args.get('hours', 0)
                    del trigger_args['hours']

                return self.schedulr.add_interval_job(func, name=id, # replace_existing=True,
                                                      hours=hours, minutes=minutes, seconds=seconds,
                                                      args=args, kwargs=kwargs)
            elif trigger is 'cron':
                # only partially implemented!!
                second = 0
                minute = 0
                hour = 0
                if 'second' in trigger_args:
                    second = trigger_args.get('second', 0)
                    del trigger_args['second']

                if 'minute' in trigger_args:
                    minute = trigger_args.get('minute', 0)
                    del trigger_args['minute']

                if 'hour' in trigger_args:
                    hour = trigger_args.get('hour', 0)
                    del trigger_args['hour']

                return self.schedulr.add_cron_job(func, name=id, # replace_existing=True,
                                                  hour=hour, minute=minute, second=second)
            else:
                raise NotImplementedError

    def shutdown(self):
        return self.schedulr.shutdown()

    # https://github.com/ralphwetzel/theonionbox/issues/19#issuecomment-263110953
    def check_tz(self):
        from tzlocal import get_localzone

        try:
            # APScheduler 3.x
            from apscheduler.util import astimezone

        except ImportError:
            # https://github.com/ralphwetzel/theonionbox/issues/31
            # APScheduler 2.x
            # import six
            from pytz import timezone, utc
            from datetime import tzinfo

            # copied here from apscheduler/util.py (version 3.4)
            # copyright Alex Grönholm
            # https://github.com/agronholm/apscheduler

            def astimezone(obj):
                """
                Interprets an object as a timezone.

                :rtype: tzinfo

                """
                # if isinstance(obj, six.string_types):
                if isinstance(obj, (str, unicode)):
                    return timezone(obj)
                if isinstance(obj, tzinfo):
                    if not hasattr(obj, 'localize') or not hasattr(obj, 'normalize'):
                        raise TypeError('Only timezones from the pytz library are supported')
                    if obj.zone == 'local':
                        raise ValueError(
                            'Unable to determine the name of the local timezone -- you must explicitly '
                            'specify the name of the local timezone. Please refrain from using timezones like '
                            'EST to prevent problems with daylight saving time. Instead, use a locale based '
                            'timezone name (such as Europe/Helsinki).')
                    return obj
                if obj is not None:
                    raise TypeError('Expected tzinfo, got %s instead' % obj.__class__.__name__)

        tz = get_localzone()
        try:
            res = astimezone(tz)
        except ValueError as ve:
            return False

        return True

