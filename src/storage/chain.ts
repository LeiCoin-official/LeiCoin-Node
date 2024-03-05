import BlockDB from "./blocks";
import WalletDB from "./wallets";

export class Chain {

    public name: string;
    public 
    public blocks: BlockDB;
    public wallets: WalletDB;
  
    private constructor() {
        this.blocks = BlockDB.getInstance();
        this.wallets = WalletDB.getInstance();
    }

}

export default Chain;