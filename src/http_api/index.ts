import cli from "../cli/cli.js";
import EventEmitter from "events";
import { ModuleLike } from "../utils/dataUtils.js";
import Elysia from "elysia";

export class HTTP_API implements ModuleLike<typeof HTTP_API> {
    public static initialized = false;
    public static started = false;
    
    private static app: Elysia;

    static async init() {
        if (this.initialized) return;
        this.initialized = true;

        this.app = (await import("./routes/main.js")).HTTPRootRouter;
    }

    static async start(config: {
        host: string,
        port: number,
        eventHandler?: EventEmitter
    }) {
        if (this.started) return;
        this.started = true;

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
        if (!this.started) return;

        if (this.app?.server) {
            this.app.server.stop();
            cli.api.info("API stopped");
        } else {
            cli.api.error("API could not be stopped, because it is not running");
        }
    }

    private static async setupEvents(eventHandler: EventEmitter) {}
}

export default HTTP_API;
