#!/bin/sh

prevCont=$(docker ps --filter ancestor=ring-home-assistant-bridge -q)
if [ "$prevCont" != "" ]; then
    docker kill "$prevCont"
    docker rm "$prevCont"
fi

prevImage=$(docker images ring-home-assistant-bridge:latest -q)

docker build . -t ring-home-assistant-bridge

docker image rm "$prevImage"

cont=$(docker-compose -f ../ha-config/docker-compose.yaml up ring-home-assistant-bridge)
sleep 5
echo "ctrl+p,ctrl+q to detach"
#ctrl+p,ctrl+q to detach