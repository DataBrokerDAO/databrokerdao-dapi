FROM alpine

RUN mkdir -p /srv/project
COPY ./build /srv/project/build
COPY ./README.md /srv/project/README.md
COPY ./*.png /srv/project/
