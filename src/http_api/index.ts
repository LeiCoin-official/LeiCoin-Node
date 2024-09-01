import cli from "../cli/cli.js";
import EventEmitter from "events";
import { ModuleLike } from "../utils/dataUtils.js";
import Elysia from "elysia";
import { HTTPRootRouter } from "./routes/main.js";

export class HTTP_API implements ModuleLike<typeof HTTP_API>{
    private static app: Elysia;

    static async init() {
        this.app = new Elysia().use(HTTPRootRouter);
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
