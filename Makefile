DNS_IP = 172.17.42.1

all: build upload

build:
	-@docker rmi dockname
	docker build -rm=true -t dockname .

upload:
	docker tag dockname netroy/dockname
	docker push netroy/dockname

start:
	-@docker stop dockname
	-@docker kill dockname && docker rm dockname
	docker run -d -p $(DNS_IP):53:53/udp dockname
