import {ContactSensorDeviceType, EntityType, Sensor} from "./types";
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
                host: jsonObj["general"]["v2"]["zid"],
                mac: jsonObj["adapter"]["v1"]["address"],
                state: {
                    "contact": jsonObj["device"]["v1"]["faulted"],
                    "battery": jsonObj["general"]["v2"]["batteryLevel"]
                },
                deviceType: ContactSensorDeviceType,
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
