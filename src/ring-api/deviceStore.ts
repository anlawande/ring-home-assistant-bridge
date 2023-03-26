import {RingDevice as RingApiDevice} from "ring-client-api"

const store: { [type: string]: {[name: string]: RingApiDevice}} = {
    locks: {},
};

function addLocks(locks: RingApiDevice[]) {
    locks.forEach(value => {
        store.locks[value.zid] = value;
    });
}

function getLockById(lockId: string): RingApiDevice {
    return store["locks"][lockId] as RingApiDevice || {};
}

export default {
    addLocks,
    getLockById,
}
