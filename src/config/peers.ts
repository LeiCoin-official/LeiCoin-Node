import path from "path";
import utils from "../utils/index.js";
import fs from "fs";
import cli from "../cli/cli.js";

export type PeersConfigLike = string[];

export class PeersConfigParser {

    private static instance: PeersConfigParser | null = null;

    constructor() {
        if (PeersConfigParser.instance) {
            return PeersConfigParser.instance;
        }
        PeersConfigParser.instance = this;
    }

    public parse() {
        const configFilePath = path.join(utils.procCWD, '/config/peers.json');
        try {
            if (fs.existsSync(configFilePath)) {
                const configData = fs.readFileSync(configFilePath, 'utf-8');
                return JSON.parse(configData) as PeersConfigLike;
            } else {
                fs.writeFileSync(configFilePath, JSON.stringify(this.sample));
                return this.sample as PeersConfigLike;
            }
        } catch (error: any) {
            cli.data.error(`Error loading peers configuration: ${error.stack}`);
            return null;
        }
    }

    private sample: string[] = []

}