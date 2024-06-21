import { Dict } from "../utils/dataUtils.js";
import cli, { type CLILike } from "./cli.js"; // @ts-ignore
import { CLICMD } from "./cliCMD.js";
import { StopCMD } from "./commands/stopCMD.js";


export class CLICMDHandler {

    private static instance: CLICMDHandler;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new CLICMDHandler();
        }
        return this.instance;
    }
    
    private readonly registry: Dict<CLICMD> = {};

    private constructor() {

        this.register(new StopCMD());

        this.setupHelpCommand();
    }

    private register(command: CLICMD) {
        this.registry[command.name] = command;
    }

    private setupHelpCommand() {
        let help_message = "Available commands:\n" +
                           " - help: Show available commands";
        for (const cmd of Object.values(this.registry)) {
            help_message += `\n - ${cmd.name}: ${cmd.description}`;
        }

        this.register(new class extends CLICMD {
            public name = "help";
            public description = "Show available commands";
            public aliases = [];
            public usage = "help";
            public async run(args: string[]): Promise<void> {
                cli.default_message.info(help_message);
            }
        });
    }

    public handle(input: string) {
        const args = input.split(" ").filter(arg => arg);
        const command_name = args.shift();
        
        if (!command_name) {
            cli.default_message.info('Command not recognized. Type "help" for available commands.');
            return;
        }

        const cmd = this.registry[command_name];

        if (!cmd) {
            cli.default_message.info(`Command '${command_name}' not found. Type "help" for available commands.`);
            return;
        }

        cmd.run(args);
    }

}

export default CLICMDHandler;

