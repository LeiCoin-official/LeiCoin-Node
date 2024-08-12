import path from "path";
import { Dict } from "../utils/dataUtils.js";
import dotenv from "dotenv";
import fs from "fs";
import utils from "../utils/index.js";
import cli from "../cli/cli.js";

export interface ENVConfigLike extends Dict<any> {}

export class ENVConfigParser {

    private static instance: ENVConfigParser | null = null

    constructor() {
        if (ENVConfigParser.instance) {
            return ENVConfigParser.instance;
        }
        ENVConfigParser.instance = this;
    }

    public parse() {
        const envFilePath = path.join(utils.procCWD, '/config/.env');
        try {
            if (fs.existsSync(envFilePath)) {
                dotenv.config({ path: envFilePath });
                const envData: ENVConfigLike = {};
                for (let key in process.env) {
                    envData[key] = process.env[key];
                }
                return envData;
            } else {
                fs.writeFileSync(envFilePath, JSON.stringify(this.sample));
                return this.sample;
            }
        } catch (error: any) {
            cli.data.error(`Error loading .env configuration: ${error.stack}`);
            return null;
        }
    }

    private sample: ENVConfigLike = {}

}
