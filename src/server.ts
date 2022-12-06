import {Request, Response} from "express";
import store from './ring-api/store';
import dotenv from 'dotenv';
import {RingApi} from "ring-client-api";
import assert from "assert";

const express = require('express');
var bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());
const port = 3000;

dotenv.config();
if (!process.env.apiToken) {
    console.log("Missing config apiToken");
    process.exit(1);
}

let healthState = false;
let ringApi: RingApi | null = null;

app.all('*', checkToken);

app.get('/entities', (req: Request, res: Response) => {
    res.json(store.printStore());
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ health: healthState });
});

app.post('/alarm', async (req: Request, res: Response) => {
    try {
        await setAlarmMode(req.body.mode);
    }
    catch (e) {
        console.error(e);
        res.status(400).send(e);
        return;
    }
    res.json({ health: healthState });
});

async function setAlarmMode(apiAlarmMode: string) {
    assert(ringApi, "Ring API is not initialized!");
    const locations = await ringApi.getLocations();
    const hostsToBypass = Object.values(store.getSensors())
        .filter(sensor => sensor.state["contact"])
        .map(sensor => sensor.host);
    for (let location of locations) {
        if (location.locationId === process.env.locationId) {
            switch (apiAlarmMode) {
                case "DISARMED":
                    await location.disarm();
                    break;
                case "HOME":
                    await location.armHome(hostsToBypass);
                    break;
                case "AWAY":
                    await location.armAway(hostsToBypass);
                    break;
                default:
                    throw new Error("Unknown ring alarm mode!");
            }
        }
    }
}

function checkToken(req: Request, res: Response, next: CallableFunction) {
    //authenticate user
    if (!req.query.apiToken || req.query.apiToken !== process.env.apiToken) {
        res.sendStatus(403);
        return;
    }
    next();
}

function init(ringApiClient: RingApi) {
    app.listen(port, () => {
        console.log(`ring-home-assistant-bridge app listening on port ${port}`)
    });
    ringApi = ringApiClient;
}

function setHealth(state: boolean) {
    healthState = state;
}

export default {
    init,
    setHealth,
}
