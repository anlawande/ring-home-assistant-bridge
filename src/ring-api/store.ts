import {Lock, Sensor} from "./types";

const store: { [type: string]: {[name: string]: Sensor | Lock}} = {
    sensors: {},
    locks: {},
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

function getSensorById(sensorId: string): Sensor {
    return store["sensors"][sensorId] || {};
}

function printStore(): object {
    return store;
}

export default {
    addSensors,
    addLocks,
    getSensorById,
    printStore,
}
