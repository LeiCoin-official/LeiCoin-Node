import utils from "../utils/index.js";
import { ProcessArgsLike, ProcessArgsParser } from "./processArgs.js";
import { GeneralConfigLike, GeneralConfigParser } from "./general.js";
import { ENVConfigLike, ENVConfigParser } from "./dotenv.js";
import { PeersConfigParser } from "./peers.js";
import fs from "fs";
import path from "path";
import cli from "../cli/cli.js";


export interface ConfigLike extends GeneralConfigLike, ENVConfigLike {
    peers: string[];
    processArgs: ProcessArgsLike;
}


export class Configs {

    private static processArgs: ProcessArgsLike;
    private static config: ConfigLike;

    private constructor() {}

    static loadProcessArgs() {
        if (!this.processArgs) {
            this.processArgs = new ProcessArgsParser().parse();
        }
        return this.processArgs;
    }

    static loadFullConfig() {
        if (!this.config) {
            this.createConfigDir();

            const defaultConfig = new GeneralConfigParser().parse();
            const peersConfig = new PeersConfigParser().parse();
            const envConfig = new ENVConfigParser().parse();
    
            if (!defaultConfig || !peersConfig || !envConfig) {
                utils.gracefulShutdown(1);
                return {} as ConfigLike;
            }
    
            this.config = {
                ...defaultConfig,
                ...envConfig,
                peers: peersConfig,
                processArgs: this.loadProcessArgs()
            };
    
            this.adjustConfigByProcessArgs();
        }
        return this.config;
    }

    private static createConfigDir() {
        const configDir = path.join(utils.procCWD, '/config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
            cli.data.info(`Directory /config was created because it was missing.`);
        }
    }

    private static adjustConfigByProcessArgs() {
        const config = this.config as ConfigLike;
        const pArgs = config.processArgs;
        const netConfig = config.leicoin_net;
        // Check for internal-port and extract the value
        if (pArgs["--port"]) netConfig.port = pArgs["--port"];
        if (pArgs["--host"]) netConfig.host = pArgs["--host"];
        if (pArgs["--experimental"]) config.experimental = pArgs["--experimental"];
    }

}

