FROM netroy/nodejs
MAINTAINER Aditya <aditya@netroy.in>

## Expose ports
EXPOSE 53

## Copy over the app
ADD . /dockname
WORKDIR /dockname

## Install dependencies
RUN npm install

## Env config
ENV DOCKER_IP 172.17.42.1
ENV DEV_DNSZONE wunder.dev
ENV DNS_PORT 53

## Setup bootstrap
CMD ["node", "/dockname/bin/dockname"]