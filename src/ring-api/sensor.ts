import {EntityType, Sensor} from "./types";
import store from "./store";
import {RingDeviceType} from "ring-client-api";

class SensorType implements EntityType<Sensor> {
    addAllToStore(sensors: Sensor[]): void {
        store.addSensors(sensors);
    }

    deserialize(json: any, bypassedHosts: Set<string>): Sensor[] {
        const sensors: Sensor[] = [];
        for (let jsonObj of json) {
            let deviceName = jsonObj["general"]["v2"]["name"];
            deviceName = deviceName || jsonObj["context"]["v1"]["deviceName"];
            deviceName += " (Contact Sensor)";

            const host = jsonObj["general"]["v2"]["zid"];

            const sensor: Sensor = {
                name: deviceName,
                host: host,
                mac: jsonObj["adapter"]["v1"]["address"],
                state: {
                    "contact": jsonObj["device"]["v1"]["faulted"],
                    "battery": jsonObj["general"]["v2"]["batteryLevel"],
                    // @ts-ignore
                    "bypassed": bypassedHosts.has(host),
                },
                deviceType: this.getDeviceType(),
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
