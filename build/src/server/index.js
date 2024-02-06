"use strict";
import express from 'express';
import expressWS from 'express-ws';
import bodyParser from 'body-parser';
import config from '../handlers/configHandler';
import cors from 'cors';
import utils from '../utils'.default;
const app = express();
expressWS(app);
app.use(cors());
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use("/api", require('./routes/api'));
app.use("/ws", require('./routes/ws_server'));
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const server = app.listen(config.server.port, () => {
    utils.server_message.log(`Server listening on port ${config.server.port}`);
});
utils.events.on("stop_server", function () {
    utils.server_message.log(`Server stopped`);
    server.close();
});
utils.ws_client_message.log("Starting WS-Client ...");
require("./ws_client");
utils.ws_client_message.log("WS-Client started");
