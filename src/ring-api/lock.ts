import {EntityType, Lock} from "./types";
import store from "./store";

class LockType implements EntityType<Lock> {
    addAllToStore(locks: Lock[]): void {
        store.addLocks(locks);
    }

    deserialize(json: any, bypassedHosts: Set<string>): Lock[] {
        const locks: Lock[] = [];
        for (let jsonObj of json) {
            let deviceName = jsonObj["general"]["v2"]["name"];
            deviceName = deviceName || jsonObj["context"]["v1"]["deviceName"];
            deviceName += " (Lock)";

            const host = jsonObj["general"]["v2"]["zid"];

            const lock: Lock = {
                name: deviceName,
                host: host,
                mac: jsonObj["adapter"]["v1"]["address"],
                state: {
                    // @ts-ignore
                    "locked": jsonObj["device"]["v1"]["locked"] === 'locked',
                    "battery": jsonObj["general"]["v2"]["batteryLevel"],
                    // @ts-ignore
                    "bypassed": bypassedHosts.has(host),
                },
                deviceType: this.getDeviceType(),
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
