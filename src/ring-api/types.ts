export enum AlarmMode {
    DISARMED = "DISARMED",
    HOME = "HOME",
    AWAY = "AWAY",
}

export interface EntityType<T> {
    getDeviceType(): string;
    addAllToStore(entities: T[]): void;
    deserialize(json: any, bypassedHosts: Set<string>): T[];
}

export interface RingDevice {
    name: string,
    mac: string,
    host: string,
    state: { [type: string]: [value: any]},
    deviceType: string,
}

export interface Alarm {
    host: string,
    mac: string,
    alarmMode: AlarmMode,
    bypassList: string[],
}

export interface Sensor extends RingDevice {}
export interface Lock extends RingDevice {}
