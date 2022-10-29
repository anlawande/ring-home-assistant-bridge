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
        let deviceName = jsonObj["general"]["v2"]["name"];
        deviceName = deviceName || jsonObj["context"]["v1"]["deviceName"];

        const sensor: Sensor = {
            name: deviceName,
            id: jsonObj["general"]["v2"]["zid"],
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
