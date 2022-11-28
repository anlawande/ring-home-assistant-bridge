import {Alarm, AlarmMode, EntityType} from "./types";
import store from "./store";
import {RingDeviceType} from "ring-client-api";

class AlarmType implements EntityType<Alarm> {
    addAllToStore(entities: Alarm[]): void {
        store.addAlarms(entities);
    }

    deserialize(json: any, bypassedHosts: Set<string>): Alarm[] {
        const alarms = [];
        for (let jsonObj of json) {
            const alarm: Alarm = {
                host: jsonObj["general"]["v2"]["zid"],
                mac: jsonObj["general"]["v2"]["zid"],
                alarmMode: getFriendlyMode(jsonObj["device"]["v1"]["mode"]),
                bypassList: [...bypassedHosts],
            }
            alarms.push(alarm);
        }
        return alarms;
    }

    getDeviceType(): string {
        return RingDeviceType.SecurityPanel;
    }
}

function getFriendlyMode(apiAlarmMode: string): AlarmMode {
    switch (apiAlarmMode) {
        case "none":
            return AlarmMode.DISARMED;
        case "some":
            return AlarmMode.HOME;
        case "all":
            return AlarmMode.AWAY;
        default:
            throw new Error("Unknown alarm mode!");
    }
}

export default AlarmType;
