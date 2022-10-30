import { RingApi } from 'ring-client-api'
import dotenv from 'dotenv';
import {acquireRefreshToken} from "./ring-api/refresh-token";
import * as fs from "fs";
import SensorType from "./ring-api/sensor";
import LockType from "./ring-api/lock";
import server from "./server";
import {EntityType} from "./ring-api/types";

const sensor = new SensorType()
const lock = new LockType()

const typeServiceMap = new Map<string, EntityType<any>>();
typeServiceMap.set(sensor.getDeviceType(), sensor);
typeServiceMap.set(lock.getDeviceType(), lock);

dotenv.config();

if (!process.env.locationId) {
    console.log("Missing config locationId");
    process.exit(1);
}

if (!process.env.tokenFile) {
    console.log("Missing config tokenFile");
    process.exit(1);
}

const fileExists = fs.existsSync(process.env.tokenFile);
let refreshToken: any = undefined;
if (fileExists) {
    refreshToken = fs.readFileSync(process.env.tokenFile, {encoding: 'utf8'});
}

const isForceAuth = process.argv[2] === 'forceAuth';

async function run() {
    if (isForceAuth || !fileExists || !refreshToken) {
        refreshToken = await acquireRefreshToken();
        fs.writeFileSync(process.env.tokenFile as string, refreshToken, {encoding: 'utf8'});
    }
    const ringApi = new RingApi({
        refreshToken, //'token generated with ring-auth-cli.  See https://github.com/dgreif/ring/wiki/Refresh-Tokens',

        // The following are all optional. See below for details
        cameraStatusPollingSeconds: 20,
        locationIds: [process.env.locationId as string]
    });
    ringApi.onRefreshTokenUpdated.subscribe(({newRefreshToken}) => {
        refreshToken = newRefreshToken;
        fs.writeFileSync(process.env.tokenFile as string, refreshToken, {encoding: 'utf8'});
    });
    await setSubscriptions(ringApi);
    server.init();
}

async function setSubscriptions(ringApi: RingApi) {
    try {
        const locations = await ringApi.getLocations();
        for (let location of locations) {
            await location.createConnection();
            location.onDeviceList.subscribe(addEntitiesToStore);
            location.onDataUpdate.subscribe(addEntitiesToStore);
        }
        server.setHealth(true);
    }
    catch (e) {
        console.log(e);
        server.setHealth(false);
    }
}

let hasInitialized = false;

function addEntitiesToStore(json: any) {
    try {
        if (json["msg"] !== 'DataUpdate' && json["msg"] !== "DeviceInfoDocGetList") {
            return;
        }
        for (let entry of typeServiceMap.entries()) {
            const deviceType = entry[0];
            const entityService = entry[1];
            let devices = [];
            for (let jsonObject of json["body"]) {
                if (!jsonObject["device"]) {
                    continue;
                }
                if (jsonObject["general"]["v2"]["deviceType"] === deviceType) {
                    devices.push(jsonObject);
                }
            }
            const typedObjects = entityService.deserialize(devices);
            entityService.addAllToStore(typedObjects);
        }

        if (!hasInitialized && json["msg"] === "DeviceInfoDocGetList") {
            hasInitialized = true;
            console.log("Loaded up all devices!");
        }
    }
    catch (e) {
        console.error(e);
        console.error(JSON.stringify(json));
        server.setHealth(false);
    }
}

run();
