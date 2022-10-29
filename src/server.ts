import {Request, Response} from "express";
import store from './ring-api/store';

const express = require('express');
const app = express();
const port = 3000;

let healthState = false;

app.get('/entities', (req: Request, res: Response) => {
    res.send(store.printStore());
});

app.get('/health', (req: Request, res: Response) => {
    res.send({ health: healthState });
});

function init() {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    });
}

function setHealth(state: boolean) {
    healthState = state;
}

export default {
    init,
    setHealth,
}
