FROM ubuntu:16.04
ENV DEBIAN_FRONTEND noninteractive
RUN apt update
RUN apt upgrade -y -y
RUN apt install -y -y wget less libglib2.0-0 libglapi-mesa libxext6 libxdamage1 libxfixes3 libxcb-glx0 libxcb-dri2-0 libxcb-dri3-0 libxcb-present0 libxcb-sync1 xserver-xorg-core libqt5x11extras5
RUN cd opt && wget -O - "https://www.dropbox.com/download?plat=lnx.x86_64" | tar xzf -
RUN groupadd -g 1000 group && useradd -u 1000 -g 1000 user
CMD /bin/bash -c '/opt/.dropbox-dist/dropboxd; /bin/bash'
