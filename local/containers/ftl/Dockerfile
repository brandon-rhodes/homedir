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

# FROM alpine:3.14
# RUN chown 1000:1000 /home
# RUN apk update
# RUN apk add --no-cache bash
# RUN apk add --no-cache alsa-lib gcompat mesa-dri-classic mesa-gl
# RUN apk add --no-cache mesa-dri-gallium
# RUN apk add --no-cache alsa-utils
# RUN apk add --no-cache strace

ENV HOME /home
WORKDIR /home
RUN mkdir -p .local/share
RUN echo 'cd /Games && cd F* && exec ./FTL' > x && chmod +x x
CMD /bin/bash
