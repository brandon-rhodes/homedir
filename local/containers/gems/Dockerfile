# Once the container is up and running, try something like:
#
# travis encrypt -r brandon-rhodes/pyephem SOMEVAR="secretvalue"

FROM ubuntu:16.04
ENV DEBIAN_FRONTEND noninteractive
RUN apt update && apt upgrade -y -y
RUN apt install -y -y build-essential ruby ruby-dev
RUN gem install travis
CMD /bin/bash
