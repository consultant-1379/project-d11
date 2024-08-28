#FROM armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/loadimpact/k6 as k6base
# Image details: https://hub.docker.com/r/loadimpact/k6/tags
FROM armdocker.rnd.ericsson.se/proj-eric-oss-dev-test/k6-base-image:latest

ARG hostname
ENV hostname_url=$hostname

WORKDIR  /home/k6/
COPY src/js .
COPY ./ci/scripts/runK6.sh .
ENTRYPOINT ["/bin/sh", "runK6.sh"]

