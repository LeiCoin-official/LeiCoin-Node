import sendTransactions_router from "./sendTransactions.js";
import { Server as HTTP_Server } from "http";
import cli from "../cli/cli.js";
import EventEmitter from "events";
import { ModuleLike } from "../utils/dataUtils.js";
import Elysia from "elysia";
import cors from "@elysiajs/cors";

export class HTTP_API implements ModuleLike<typeof HTTP_API>{
    private static app: Elysia;

    static async init() {
        this.app = new Elysia()
            .use(cors({
                origin: "*"
            }))
            .get('/', async ({set}) => {
                set.status = 200;
                return Response.json({ message: "Online" });
            })
            /*.all('*', ({path, set}) => {
                set.status = 404;
                return Response.json({ error: "Not Found", path })
            })*/
            .post('/send', () => {
                return Response.json({ message: "sendtransactions" });
            })
            /*.onError(({ code, error, set }) => {
                set.status = 500;
                return Response.json({ error });
            })*/
        
        //this.app.use('/sendtransactions', sendTransactions_router);
    }


    static async start(config: {
        host: string,
        port: number,
        eventHandler?: EventEmitter
    }) {
        this.app = this.app.listen({
            port: config.port,
            hostname: config.host,
        });
        if (this.app.server) {
            cli.api.info(`API listening on ${config.host}:${config.port}`);
        }
        if (config.eventHandler) {
            await this.setupEvents(config.eventHandler);
        }
    }

    static async stop() {
        if (this.app?.server) {
            this.app.server.stop();
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
