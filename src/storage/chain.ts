import BlockDB from "./blocks.js";
import MinterDB from "./minters.js";
import SmartContractStateDB from "./smart-contract-state.js";
import WalletDB from "./wallets.js";

export class Chain {

    public readonly name: string;
    public readonly blocks: BlockDB;
    public readonly wallets: WalletDB;
    public readonly cstates: SmartContractStateDB;
    public readonly minters: MinterDB;

    constructor(name = "main") {
        this.name = name;
        this.blocks = new BlockDB(name);
        this.wallets = new WalletDB(name);
        this.cstates = new SmartContractStateDB(name);
        this.minters = new MinterDB(name);
    }

    public async waitAllinit() {
        await Promise.all([
            this.wallets.init(),
            this.cstates.init(),
            this.minters.init(),
        ])
    }

    public async close() {
        await Promise.all([
            this.wallets.close(),
            this.cstates.close(),
            this.minters.close(),
        ]);
    }

}

export default Chain;
