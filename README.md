## Ring Device Bridge
This application connects to the ring api via websockets and exposes the live up-to-date 
states of the various sensors and and control the alarm states

## Building and running

#### Build dependencies and code
local
```shell
npm ci
npx tsc
```
docker
```shell
docker build . -t ring-home-assistant-bridge
```
#### Runtime dependencies

The application depends on an `.env` file being present in the project root. (See sample)

Also a token file must be present at the location specified in the `.env` file

Since these files will persist data even when the application is not running, for docker setup
it is essential to provide these files as docker volumes. (See docker-compose.yaml)

#### Running for the first time

1. Rename the `.env.sample` file to `.env`
2. Enter your ring email and password in the `.env` file
3. Run the application and pass `forceAuth` parameter
    1. local `node build/init.js forceAuth`
    2. docker `docker run ring-device-bridge forceAuth`
4. Enter the 2FA code sent to your mobile device
5. Note the locationId outputted to console. Enter it in the `.env` file
6. Token file is now populated with the refresh token

#### Running subsequently

1.
    1. local `node build/init.js`
    2. docker `docker up [-d] ring-device-bridge`

#### Ring device API
Exposed on http://localhost:3000/entities (3123 docker)

For more info
1. https://github.com/dgreif/ring (source repository)
2. Inspect the typescript types for methods that can be called

