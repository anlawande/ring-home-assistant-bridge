import {EntityType, Lock, LockDeviceType} from "./types";
import store from "./store";

class LockType implements EntityType<Lock> {
    addAllToStore(locks: Lock[]): void {
        store.addLocks(locks);
    }

    deserialize(json: any): Lock[] {
        const locks: Lock[] = [];
        for (let jsonObj of json) {
            let deviceName = jsonObj["general"]["v2"]["name"];
            deviceName = deviceName || jsonObj["context"]["v1"]["deviceName"];
            deviceName += " (Lock)"

            const lock: Lock = {
                name: deviceName,
                host: jsonObj["general"]["v2"]["zid"],
                mac: jsonObj["adapter"]["v1"]["address"],
                state: {
                    // @ts-ignore
                    "locked": jsonObj["device"]["v1"]["locked"] === 'locked',
                    "battery": jsonObj["general"]["v2"]["batteryLevel"]
                },
                deviceType: LockDeviceType,
            }
            locks.push(lock);
        }
        return locks;
    }

    getDeviceType(): string {
        return "lock";
    }

}

export default LockType;
