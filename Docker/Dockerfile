FROM python:2.7

EXPOSE 8080

RUN pip install theonionbox \
	&& pip install urllib3==1.22

COPY theonionbox.cfg /usr/local/lib/python2.7/site-packages/theonionbox/config/

ENTRYPOINT ["/usr/local/bin/theonionbox"]
