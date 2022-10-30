import {EntityType, Sensor} from "./types";
import store from "./store";
import {RingDeviceType} from "ring-client-api";

class SensorType implements EntityType<Sensor> {
    addAllToStore(sensors: Sensor[]): void {
        store.addSensors(sensors);
    }

    deserialize(json: any): Sensor[] {
        const sensors: Sensor[] = [];
        for (let jsonObj of json) {
            let deviceName = jsonObj["general"]["v2"]["name"];
            deviceName = deviceName || jsonObj["context"]["v1"]["deviceName"];
            deviceName += " (Contact Sensor)";

            const sensor: Sensor = {
                name: deviceName,
                id: jsonObj["general"]["v2"]["zid"],
                state: jsonObj["device"]["v1"]["faulted"],
            }
            sensors.push(sensor);
        }
        return sensors;
    }

    getDeviceType(): string {
        return RingDeviceType.ContactSensor;
    }

}

export default SensorType;
