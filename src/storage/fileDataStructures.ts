export interface ChainstateData {
    version: string;
    chains: {
        [fork: string]: {
            previousBlockInfo: {
                index: string;
                hash: string;
            };
            latestBlockInfo: {
                index: string;
                hash: string;
            };
        }
    }
}