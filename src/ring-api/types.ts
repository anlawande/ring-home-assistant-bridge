export interface EntityType<T> {
    getDeviceType(): string;
    addAllToStore(entities: T[]): void;
    deserialize(json: any): T[];
}


export interface Sensor {
    name: string,
    id: string,
    state: boolean,
}

export interface Lock {
    name: string,
    id: string,
    state: boolean,
}
