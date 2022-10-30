import {EntityType, Lock} from "./types";
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
                id: jsonObj["general"]["v2"]["zid"],
                state: jsonObj["device"]["v1"]["locked"] === 'locked',
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
