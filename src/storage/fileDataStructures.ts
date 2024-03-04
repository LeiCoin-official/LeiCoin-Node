export interface LatestBlockInfo {
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