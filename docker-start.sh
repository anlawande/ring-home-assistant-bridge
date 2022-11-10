#!/bin/sh

prevCont=$(docker ps --filter ancestor=ring-home-assistant-bridge -q)
if [ "$prevCont" != "" ]; then
    docker kill "$prevCont"
    docker rm "$prevCont"
fi

prevImage=$(docker images ring-home-assistant-bridge:latest -q)

docker build . -t ring-home-assistant-bridge

docker image rm "$prevImage"

echo "ctrl+p,ctrl+q to detach"
docker-compose run --service-ports ring-home-assistant-bridge
#ctrl+p,ctrl+q to detach