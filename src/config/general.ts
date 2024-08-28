import path from "path";
import fs from "fs";
import cli from "../cli/cli.js";
import Utils from "../utils/index.js";

export interface GeneralConfigLike {
    leicoin_net: {
        host: string;
        port: number;
    };
    staker: {
        active: boolean;
        stakers: Array<{
            readonly privateKey: string;
            readonly address: string;
        }>;
    };
    api: {
        active: boolean;
        host: string;
        port: number;
    };
    experimental: boolean
}

export class GeneralConfigParser {

    private static instance: GeneralConfigParser;

    constructor() {
        if (GeneralConfigParser.instance) {
            return GeneralConfigParser.instance;
        }
        GeneralConfigParser.instance = this;
    }

    public parse() {
        const configFilePath = path.join(Utils.procCWD, "/config/config.json");
        try {
            if (fs.existsSync(configFilePath)) {
                const configData = fs.readFileSync(configFilePath, "utf-8");
                return JSON.parse(configData) as GeneralConfigLike;
            } else {
                fs.writeFileSync(configFilePath, JSON.stringify(this.sample, null, 4));
                return this.sample;
            }
        } catch (error: any) {
            cli.data.error(`Error loading config configuration: ${error.stack}`);
            return null;
        }
    }

    private readonly sample: GeneralConfigLike = {
        leicoin_net: {
            host: "0.0.0.0",
            port: 12200
        },
        staker: {
            active: false,
            stakers: [
                {
                    privateKey: "",
                    address: ""
                }
            ]
        },
        api: {
            "active": false,
            "host": "0.0.0.0",
            "port": 12280
        },
        experimental: false
    }

}
