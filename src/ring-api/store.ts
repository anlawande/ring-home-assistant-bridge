import {Alarm, Lock, Sensor} from "./types";

const store: { [type: string]: {[name: string]: Sensor | Lock | Alarm}} = {
    sensors: {},
    locks: {},
    alarms: {},
};

function addSensors(sensors: Sensor[]) {
    sensors.forEach(value => {
        store.sensors[value.mac] = value;
    });
}

function addLocks(locks: Lock[]) {
    locks.forEach(value => {
        store.locks[value.mac] = value;
    });
}

function addAlarms(alarms: Alarm[]) {
    alarms.forEach(value => {
        store.alarms[value.host] = value;
    });
}

function getSensorById(sensorId: string): Sensor {
    return store["sensors"][sensorId] as Sensor || {};
}

function getLockById(lockId: string): Lock {
    return store["locks"][lockId] as Lock || {};
}

function printStore(): object {
    return store;
}

export default {
    addSensors,
    addLocks,
    addAlarms,
    getSensorById,
    getLockById,
    printStore,
}
