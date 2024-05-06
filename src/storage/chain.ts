import BlockDB from "./blocks.js";
import SmartContractStateDB from "./smart-contract-state.js";
import ValidatorDB from "./validators.js";
import WalletDB from "./wallets.js";

export class Chain {

    public readonly name: string;
    public readonly blocks: BlockDB;
    public readonly wallets: WalletDB;
    public readonly cstates: SmartContractStateDB;
    public readonly validators: ValidatorDB;

    constructor(name = "main") {
        this.name = name;
        this.blocks = new BlockDB(name);
        this.wallets = new WalletDB(name);
        this.cstates = new SmartContractStateDB(name);
        this.validators = new ValidatorDB(name);
    }

}

export default Chain;
