# You can use ~/bin/,docker to get this container is up and running.
# Then, try something like (given that headers from Twitter can be, for
# one example URL, 5004 bytes long):
#
# go install github.com/raviqqe/muffet/v2@latest
# muffet -b 8192 --rate-limit=5 https://rhodesmill.org > OUT

FROM ubuntu:22.04
ENV DEBIAN_FRONTEND noninteractive
RUN apt update && apt upgrade -y -y
RUN apt install -y -y build-essential
RUN apt install -y -y less golang-go golint
RUN apt install -y -y strace
RUN apt install -y -y iputils-ping
RUN apt install -y -y ca-certificates
CMD cd /cwd && PATH=$PATH:/root/go/bin && /bin/bash
