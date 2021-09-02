# Once the container is up and running, try something like:
#
# travis encrypt -r brandon-rhodes/pyephem SOMEVAR="secretvalue"

FROM ubuntu:21.04
ENV DEBIAN_FRONTEND noninteractive
RUN apt update && apt upgrade -y -y
RUN apt install -y -y build-essential
RUN apt install -y -y less python2.7-dev python3-dev
RUN ln -s python2.7 /usr/bin/python
CMD cd /mnt && /bin/bash
