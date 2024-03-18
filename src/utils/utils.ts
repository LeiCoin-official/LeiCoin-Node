import process from "process";
import { EventEmitter } from "events";
import type { CLI } from "./cli.js";
import Constants from "./constants.js";
import BigNum from "./bigNum.js";

// Define a generic interface representing the class structure
interface Constructable<T> {
    new (...args: any[]): T;
}


class Utils {

    private static instance: Utils;

    public static getInstance() {
        if (!Utils.instance) {
            Utils.instance = new Utils();
        }
        return Utils.instance;
    }

    private cli: CLI | null = null;

    public readonly events = new EventEmitter();

    public readonly processRootDirectory = process.cwd();

    public readonly mining_difficulty = 6;
    public readonly mining_pow = "10";


    private constructor() {
        process.on("SIGINT", this.gracefulShutdown);
        process.on("SIGTERM", this.gracefulShutdown);
    }
    
    // Function to get the current date and time as a formatted string
    public getCurrentTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}-${hour}-${minute}-${second}`;
    }


    public async gracefulShutdown(exitCode: number = 0) {
        try {
            if (!this.cli)
            this.cli = (await import("./cli.js")).default;
            this.cli.default_message.log('Shutting down...');
            this.events.emit("stop_server");
            setTimeout(async() => {
                this.cli?.default_message.log('LeiCoin-Node stopped.');
                await this.cli?.close();
                process.exit(exitCode);
            }, 1000);
        } catch {
            process.exit(1);
        }
    }
    
    // Define a function to create an instance of a class from a JSON object
    public createInstanceFromJSON<T>(cls: Constructable<T>, json: any): T {
        // Retrieve the constructor of the class
        const constructor = cls as any;
    
        // Retrieve the parameter names of the constructor
        const paramNames = constructor.toString().match(/\(([^)]+)\)/)?.[1].split(',').map((param: string) => param.trim()) || [];
    
        // Create an array of arguments for the constructor
        const args = paramNames.map((paramName: string) => json[paramName]);
    
        // Instantiate the class with the arguments
        const instance = Reflect.construct(cls, args);
    
        // Return the instance
        return instance;
    }

    public sortObjectAlphabetical<T extends Object>(obj: T): T {
        const deepSort = (input: any): any => {
            if (typeof input !== 'object' || input === null) {
                return input;
            }
    
            if (Array.isArray(input)) {
                return input.map(deepSort);
            }
    
            const sortedObj: { [key: string]: any } = {};
            Object.keys(input)
                .sort()
                .forEach(key => {
                    sortedObj[key] = deepSort(input[key]);
                });
            return sortedObj;
        };
    
        const sortedObj = deepSort(obj);
        return sortedObj;
    }

    public calculateEpochAndRelativeSlot(slotIndex: string) {
        const currentEpoch = BigNum.divide(slotIndex, Constants.BLOCKS_PER_EPOCH);
        const relativeSlot = BigNum.mod(slotIndex, Constants.BLOCKS_PER_EPOCH);
        return { currentEpoch, relativeSlot };
    }

}

export default Utils.getInstance();
