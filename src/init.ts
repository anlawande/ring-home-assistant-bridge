import {RingApi, RingDevice} from 'ring-client-api'
import dotenv from 'dotenv';
import {acquireRefreshToken} from "./ring-api/refresh-token";
import * as fs from "fs";
import SensorType from "./ring-api/sensor";
import LockType from "./ring-api/lock";
import server from "./server";
import {EntityType} from "./ring-api/types";
import AlarmType from "./ring-api/alarm";
import store from "./ring-api/store";
import deviceStore from "./ring-api/deviceStore";
import {RingDevice as RingApiDevice} from "ring-client-api"

const sensor = new SensorType()
const lock = new LockType()
const alarm = new AlarmType()

const typeServiceMap = new Map<string, EntityType<any>>();
typeServiceMap.set(sensor.getDeviceType(), sensor);
typeServiceMap.set(lock.getDeviceType(), lock);
typeServiceMap.set(alarm.getDeviceType(), alarm);

dotenv.config();

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
    const locationIds = process.env.locationId ? [process.env.locationId as string] : undefined;
    const ringApi = new RingApi({
        refreshToken, //'token generated with ring-auth-cli.  See https://github.com/dgreif/ring/wiki/Refresh-Tokens',

        // The following are all optional. See below for details
        cameraStatusPollingSeconds: 20,
        locationIds,
    });
    ringApi.onRefreshTokenUpdated.subscribe(({newRefreshToken}) => {
        refreshToken = newRefreshToken;
        fs.writeFileSync(process.env.tokenFile as string, refreshToken, {encoding: 'utf8'});
    });
    await setSubscriptions(ringApi);
    server.init(ringApi);
}

async function setSubscriptions(ringApi: RingApi) {
    try {
        const locations = await ringApi.getLocations();
        for (let location of locations) {
            if (isForceAuth) {
                console.log(`locationId: ${location.locationId}`);
                process.exit(0);
                return;
            }
            await location.createConnection();
            location.onDeviceList.subscribe(addEntitiesToStore);
            location.onDataUpdate.subscribe(addEntitiesToStore);

            //This is a duplicate of subscribing to the device list above
            //but the above is raw json device response vs below if cast to RingDevice type
            //that is easier to call sendMessage functionality
            addDeviceEntitiesToStore(await location.getDevices());
        }
        server.setHealth(true);
    }
    catch (e) {
        console.log(e);
        server.setHealth(false);
    }
}

let hasInitialized = false;

function getDevicesByType(json: any, deviceType: string): any[] {
    let devices: any[] = [];
    if (!json["body"]) {
        return devices;
    }
    for (let jsonObject of json["body"]) {
        if (!jsonObject["device"]) {
            continue;
        }
        if (jsonObject["general"]["v2"]["deviceType"] === deviceType) {
            devices.push(jsonObject);
        }
    }
    return devices;
}

function addEntitiesToStore(json: any) {
    try {
        if (json["msg"] !== 'DataUpdate' && json["msg"] !== "DeviceInfoDocGetList") {
            return;
        }
        if (json["context"] && json["context"]["eventLevel"] === 80) {
            return;
        }

        const bypassedHosts = getBypassedHosts(json);
        const previousBypassedHosts = getPreviousBypassedHosts();

        for (let entry of typeServiceMap.entries()) {
            const deviceType = entry[0];
            const entityService = entry[1];
            const devices = getDevicesByType(json, deviceType);
            const typedObjects = entityService.deserialize(devices, bypassedHosts);
            entityService.addAllToStore(typedObjects);
        }

        if (!eqSet(bypassedHosts, previousBypassedHosts)) {
            sensor.updateBypassed(bypassedHosts);
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

function addDeviceEntitiesToStore(devices: RingApiDevice[]) {
    const locks = [];
    for (let device of devices) {
        if (device.deviceType == lock.getDeviceType()) {
            locks.push(device);
        }
    }
    deviceStore.addLocks(locks);
}

function getBypassedHosts(json: any): Set<string> {
    const bypassedHosts: Set<string> = new Set();

    if (!json["body"]) {
        return bypassedHosts;
    }
    const securityPanels = getDevicesByType(json, alarm.getDeviceType());
    if (!securityPanels.length) {
        // console.warn("No security panel found!");
        return bypassedHosts;
    }
    const securityPanel = securityPanels[0];

    const bypasses = securityPanel["device"]["v1"]["bypasses"] || securityPanel["context"]["v1"]["device"]["v1"]["bypasses"]
    bypasses.map((bypassObj: any) => bypassedHosts.add(bypassObj["zid"]));

    return bypassedHosts;
}

function getPreviousBypassedHosts(): Set<string> {
    const alarms = Object.values(store.getAlarms());
    if (!alarms.length) {
        return new Set();
    }
    return new Set(alarms[0].bypassList);
}

const eqSet = (xs: Set<any>, ys: Set<any>) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

run();
