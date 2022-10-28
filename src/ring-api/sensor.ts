import {Sensor} from "./types";
import store from "./store";
import {RingDeviceType} from "ring-client-api";

const deviceType = RingDeviceType.ContactSensor;

function addSensors(sensors: Sensor[]) {
    store.addSensors(sensors);
}

function getSensorById(sensorId: string): Sensor {
    return store.getSensorById(sensorId);
}

function deserialize(json: any[]): Sensor[] {
    const sensors: Sensor[] = [];
    for (let jsonObj of json) {
        const sensor: Sensor = {
            name: jsonObj["general"]["v2"]["name"],
            id: jsonObj["general"]["v2"]["catalogId"],
            state: jsonObj["device"]["v1"]["faulted"],
        }
        sensors.push(sensor);
    }
    return sensors;
}

export default {
    deviceType,
    addSensors,
    getSensorById,
    deserialize,
}
