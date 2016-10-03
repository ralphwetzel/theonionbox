#####
# Class to support APScheduler v3 (default) and v2
# despite their interfaces are incompatible!


class Scheduler(object):

    schedulr = None
    aps30 = True

    def __init__(self):

        #####
        # ApScheduler version detection
        import apscheduler
        self.aps30 = apscheduler.version_info >= (3, 0, 0)

        if self.aps30:
            # APScheduler 3.x implementation
            from apscheduler.schedulers.background import BackgroundScheduler
            self.schedulr = BackgroundScheduler()
        else:
            # APScheduler 2.x implementation
            from apscheduler.scheduler import Scheduler
            self.schedulr = Scheduler()

    def start(self):
        return self.schedulr.start()

    def get_job(self, name):
        if self.aps30:
            return self.schedulr.get_job(name)
        else:
            jobs = self.schedulr.get_jobs()
            for job in jobs:
                if job.name == name:
                    return job

            return None

    def add_job(self, func, trigger, id=None, *args, **kwargs):
        if self.aps30:
            return self.schedulr.add_job(func, trigger, id=id, args=args, kwargs=kwargs)
        else:
            if trigger is 'date':
                run_date = kwargs['run_date']   # by intention: to raise if not set!
                del kwargs['run_date']
                return self.schedulr.add_date_job(func, run_date, name=id, args=args, kwargs=kwargs)
            elif trigger is 'interval':
                # only partially implemented!!
                seconds = 0
                minutes = 0
                hours = 0
                if 'seconds' in kwargs:
                    seconds = kwargs.get('seconds', 0)
                    del kwargs['seconds']

                if 'minutes' in kwargs:
                    minutes = kwargs.get('minutes', 0)
                    del kwargs['minutes']

                if 'hours' in kwargs:
                    hours = kwargs.get('hours', 0)
                    del kwargs['hours']

                return self.schedulr.add_interval_job(func, name=id,
                                                      hours=hours, minutes=minutes, seconds=seconds,
                                                      args=args, kwargs=kwargs)
            elif trigger is 'cron':
                # only partially implemented!!
                second = 0
                minute = 0
                hour = 0
                if 'second' in kwargs:
                    second = kwargs.get('second', 0)
                    del kwargs['second']

                if 'minute' in kwargs:
                    minute = kwargs.get('minute', 0)
                    del kwargs['minute']

                if 'hour' in kwargs:
                    hour = kwargs.get('hour', 0)
                    del kwargs['hour']

                return self.schedulr.add_cron_job(func, name=id, hour=hour, minute=minute, second=second)
            else:
                raise NotImplementedError

    def shutdown(self):
        return self.schedulr.shutdown()
