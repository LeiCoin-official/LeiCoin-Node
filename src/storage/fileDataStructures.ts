export interface LatestBlockInfo {
    [fork: string]: {
        previousBlockInfo: {
            index: number;
            hash: string;
        };
        latestBlockInfo: {
            index: number;
            hash: string;
        };
    }
}