
export class Constants {

    static readonly GENESIS = 0;

    // please change this value when using in MainNet
    static readonly GENESIS_TIME = 1718841600_000;

    // 15000 milliseconds (= 15 seconds)
    static readonly BLOCK_TIME = 15_000;
    
    //static readonly BLOCKS_PER_EPOCH = 32;
    //static readonly LAST_EPOCH_SLOT = 31;

    //static readonly MIN_VALIDATORS_EPOCH = 8;
    //static readonly MIN_VALIDATORS_SLOT = 4;
    static readonly MAX_VALIDATORS = 128;

    // maybe later in percentage
    static readonly STAKE_REWARD = 5_00;

    // maybe later in percentage
    static readonly SLASHING_AMOUNT = 5_00;

}

export default Constants;
