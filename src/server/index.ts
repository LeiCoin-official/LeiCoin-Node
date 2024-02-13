import express from "express";
import expressWS from "express-ws";
import bodyParser from "body-parser";
import config from "../handlers/configHandler.js";
import cors from "cors";
import utils from "../utils.js";

import api_router from "./routes/api/index.js";

async function initServer() {
    const app = express();

    expressWS(app);

    app.use(cors());
    app.use(bodyParser.json());

    app.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use("/api", api_router);

    app.use("/ws", (await import("./routes/ws_server/index.js")).default);

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    const server = app.listen(config.server.port, () => {
        utils.server_message.log(`Server listening on port ${config.server.port}`);
    });
    
    utils.events.on("stop_server", function() {
        utils.server_message.log(`Server stopped`);
        server.close();
    });

}

initServer();

utils.ws_client_message.log("Starting WS-Client ...");
import "./ws_client/index.js";
utils.ws_client_message.log("WS-Client started");