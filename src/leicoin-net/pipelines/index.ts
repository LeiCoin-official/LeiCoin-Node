import { LeiCoinNetDataPackage, LNPPX } from "../packages.js";
import { Uint } from "../../binary/uint.js";
import { CB } from "../../utils/callbacks.js";
import BlockPipeline from "./blocks.js";
import TransactionPipeline from "./transactions.js";

export interface PipelineLike {
    receive(type: LNPPX, data: Uint): Promise<void>;
    broadcast(type: LNPPX, data: Uint, ...args: any[]): Promise<void>;
}

export class Pipelines {

    private static instance: Pipelines;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Pipelines();
        }
        return this.instance;
    }

    private pipelines: { [id: string]: PipelineLike } = {
        "2096": BlockPipeline,
        "427d": TransactionPipeline,
        //"01xx": SomePipeline, the x is used as a wildcard
    };

    public async receiveData(rawData: Buffer) {

        const data = LeiCoinNetDataPackage.extract(rawData);

        let matchedPipelineId: string | undefined;
        for (const id in this.pipelines) {
            if (new RegExp(`^${id.replace(/x/g, ".")}$`).test(data.type.toHex())) {
                matchedPipelineId = id;
                break;
            }
        }

        if (!matchedPipelineId) {
            return { cb: CB.NONE, message: `Unknown Data Type: ${data.type}` };
        }

        await this.pipelines[data.type.toHex()].receive(data.type, data.content);

    }

}

const pipelines = Pipelines.getInstance();
export default pipelines;
