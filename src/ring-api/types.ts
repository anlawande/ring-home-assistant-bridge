export interface EntityType<T> {
    getDeviceType(): string;
    addAllToStore(entities: T[]): void;
    deserialize(json: any): T[];
}

export interface RingDevice {
    name: string,
    mac: string,
    host: string,
    state: { [type: string]: [value: any]},
    deviceType: string,
}

export interface Sensor extends RingDevice {}
export interface Lock extends RingDevice {}

export const ContactSensorDeviceType = "ContactSensor"
export const LockDeviceType = "Lock"
