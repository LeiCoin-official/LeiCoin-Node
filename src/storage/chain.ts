import BlockDB from "./blocks";
import WalletDB from "./wallets";

export class Chain {

    public name: string;
    public blocks: BlockDB;
    public wallets: WalletDB;

    constructor(name = "main") {
        this.name = name;
        this.blocks = new BlockDB(name);
        this.wallets = new WalletDB();
    }

}

export default Chain;