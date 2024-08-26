import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sendTransactions_router from "./sendTransactions.js";
import { Server as HTTP_Server } from "http";
import cli from "../cli/cli.js";
import EventEmitter from "events";

export class HTTP_API {
    private static app: express.Express;
    private static server: HTTP_Server;

    static async start(config: {
        host: string,
        port: number,
        eventHandler?: EventEmitter
    }) {
        this.createApp();
        this.server = this.app.listen(config.port, config.host, () => {
            cli.api.info(`API listening on ${config.host}:${config.port}`);
        });
        if (config.eventHandler) {
            await this.setupEvents(config.eventHandler);
        }
    }

    private static createApp() {
        this.app = express();

        this.app.use(cors());
        this.app.use(bodyParser.json());
        
        this.app.use(function(req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        
        this.app.use('/', (req, res, next) => {
            res.status(200);
            res.json({ message: "Online" });
        });
        
        this.app.use('/sendtransactions', sendTransactions_router);
    }

    static async stop() {
        if (this.server) {
            this.server.close();
            cli.api.info("API stopped");
        } else {
            cli.api.error("API could not be stopped, because it is not running");
            return;
        }
    }

    private static async setupEvents(eventHandler: EventEmitter) {
        eventHandler.once("stop_server", async() => await this.stop());
    }
}

export default HTTP_API;
