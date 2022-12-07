#!/bin/sh

# kill previous containers
prevCont=$(docker ps --filter ancestor=ring-home-assistant-bridge -q)
if [ "$prevCont" != "" ]; then
    docker kill "$prevCont"
    docker rm "$prevCont"
fi

# previous image id
prevImage=$(docker images ring-home-assistant-bridge:latest -q)

# build new image to latest tag
docker build . -t ring-home-assistant-bridge

# delete previous image
docker image rm "$prevImage"

# Start new containers
docker-compose up -d ring-home-assistant-bridge
