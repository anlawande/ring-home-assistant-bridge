import {Request, Response} from "express";
import store from './ring-api/store';

const express = require('express');
const app = express();
const port = 3000;

let healthState = false;

app.get('/entities', (req: Request, res: Response) => {
    res.json(store.printStore());
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ health: healthState });
});

function init() {
    app.listen(port, () => {
        console.log(`ring-home-assistant-bridge app listening on port ${port}`)
    });
}

function setHealth(state: boolean) {
    healthState = state;
}

export default {
    init,
    setHealth,
}
