#!/bin/sh

prevCont=$(docker ps --filter ancestor=ring-home-assistant-bridge -q)
if [ "$prevCont" != "" ]; then
    docker kill "$prevCont"
    docker rm "$prevCont"
fi

prevImage=$(docker images ring-home-assistant-bridge:latest -q)

docker build . -t ring-home-assistant-bridge

#docker image rm "$prevImage"

cont=$(docker-compose run -dti airgram)
sleep 5
echo "ctrl+p,ctrl+q to detach"
docker attach --sig-proxy=false "$cont"
#ctrl+p,ctrl+q to detach