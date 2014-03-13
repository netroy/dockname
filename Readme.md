zero-conf dynamic dns for docker containers

#### TODO
* multiple A records for the same name
* handle dead containers
* external config (~/.dockname)
* docker info from ENV variables
* SRV records
* Installation script (like pow)
  * either setup dns server to run on a certain port & iptables to forward all 127.0.0.1:53 to that port
  * or run the DNS server in a docker container as well
* set /etc/resolver/dev to point to 127.0.0.1/container IP  (http://passingcuriosity.com/2013/dnsmasq-dev-osx/)
* use since on events after disconnects