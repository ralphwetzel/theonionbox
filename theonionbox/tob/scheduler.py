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
        except:
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
        if self.aps3:
            return self.schedulr.add_job(func, trigger, id=id, args=args, kwargs=kwargs, **trigger_args)
        else:
            if trigger is 'date':
                run_date = trigger_args['run_date']   # by intention: to raise if not set!
                del trigger_args['run_date']
                return self.schedulr.add_date_job(func, run_date, name=id, args=args, kwargs=kwargs)
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

                return self.schedulr.add_interval_job(func, name=id,
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

                return self.schedulr.add_cron_job(func, name=id, hour=hour, minute=minute, second=second)
            else:
                raise NotImplementedError

    def shutdown(self):
        return self.schedulr.shutdown()

    # https://github.com/ralphwetzel/theonionbox/issues/19#issuecomment-263110953
    def check_tz(self):
        from tzlocal import get_localzone
        from apscheduler.util import astimezone
        tz = get_localzone()
        try:
            res = astimezone(tz)
        except ValueError as ve:
            return False

        return True

