# Once the container is up and running, try something like:
#
# travis encrypt -r brandon-rhodes/pyephem SOMEVAR="secretvalue"

FROM ubuntu:24.04
ENV DEBIAN_FRONTEND noninteractive
RUN apt update && apt upgrade -y -y
RUN apt install -y -y build-essential less python3-dev
RUN apt install -y -y curl telnet
RUN apt install -y -y wget
RUN apt install -y -y git
RUN apt install -y -y nano

WORKDIR /work
CMD ["/bin/bash"]
