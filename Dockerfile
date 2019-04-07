FROM python:3.7

EXPOSE 8080

COPY setup.py ./
COPY theonionbox ./theonionbox

RUN pip install theonionbox

ENTRYPOINT ["/usr/local/bin/theonionbox"]