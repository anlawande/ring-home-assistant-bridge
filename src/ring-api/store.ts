import {Sensor} from "./types";

const store: { [type: string]: {[name: string]: Sensor}} = {
    sensors: {},
};

function addSensors(sensors: Sensor[]) {
    sensors.forEach(value => {
        store.sensors[value.id] = value;
    });
}

function getSensorById(sensorId: string): Sensor {
    return store["sensors"][sensorId] || {};
}

function printStore(): string {
    return JSON.stringify(store);
}

export default {
    addSensors,
    getSensorById,
    printStore,
}
