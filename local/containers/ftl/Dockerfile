# Generic Dockerfile for running X windows applications.

FROM ubuntu:20.04
ENV DEBIAN_FRONTEND noninteractive
RUN apt  update
RUN apt install -y -y libgl1 libasound2
RUN apt install -y -y x11-utils
RUN apt install -y -y strace
RUN apt install -y -y less
RUN apt install -y -y xserver-xorg-video-fbdev
RUN chown 1000:1000 /home

ENV HOME /home
WORKDIR /home
RUN mkdir -p .local/share
RUN echo 'cd /Games && cd F* && exec ./FTL' > run-ftl && chmod +x run-ftl
#CMD bash
CMD ./run-ftl
#CMD strace -f -o /Games/trace.out /Games/FTL.1.6.12.Linux/data/FTL.amd64
