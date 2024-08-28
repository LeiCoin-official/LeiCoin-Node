import { type Uint } from "../../binary/uint.js";
import LeiCoinNetNode from "../index.js";
import { LeiCoinNetDataPackage, type LNPPX } from "../packages.js";

export type PipelineConstructor<T extends Pipeline = Pipeline> = new() => T;

export abstract class Pipeline {

    abstract readonly id: string;

    abstract receive(type: LNPPX, data: Uint): Promise<void>;
    
    async broadcast(type: LNPPX, data: Uint, ...args: any[]) {
        await LeiCoinNetNode.broadcast(LeiCoinNetDataPackage.create(type, data));
    }
}