# https://wiki.alpinelinux.org/wiki/How_to_build_the_Alpine_Linux_kernel

FROM docker.io/i386/alpine:3.23.2
RUN apk add bash
RUN echo permit nopass brandon > /etc/doas.conf
RUN apk add doas
RUN adduser brandon -D -g "Brandon" -s /bin/bash
RUN apk add alpine-sdk
RUN addgroup brandon abuild
RUN su brandon -c 'abuild-keygen -n --append --install'
RUN apk add ccache
RUN echo USE_CCACHE=1 >> /etc/abuild.conf

WORKDIR /home/brandon
CMD exec su brandon
