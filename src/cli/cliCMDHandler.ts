import CLISubCMDManager from "./cliSubCMDManager.js";
import GenKairPairCMD from "./commands/genKeyPairCMD.js";
import StopCMD from "./commands/stopCMD.js";
import ValidatorDBCMD from "./commands/validatorDBCMD.js";


export class CLICMDHandler extends CLISubCMDManager {
    public name = "root";
    public description = "CLI Root";
    public usage = "Command has no usage";

    private static instance: CLICMDHandler;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new CLICMDHandler();
        }
        return this.instance;
    }

    protected registerCommands(): void {
        this.register(new StopCMD());
        this.register(new GenKairPairCMD());
        this.register(new ValidatorDBCMD());
    }

    public async handle(input: string) {
        this.run(input.trim().toLowerCase().split(" ").filter(arg => arg), []);
    }

}

export default CLICMDHandler;

