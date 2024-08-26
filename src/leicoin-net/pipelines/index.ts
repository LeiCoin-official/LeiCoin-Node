import { LeiCoinNetDataPackage, type LNPPX } from "../packages.js";
import { type Uint } from "../../binary/uint.js";
import { CB } from "../../utils/callbacks.js";
import BlockPipeline from "./blocks.js";
import TransactionPipeline from "./transactions.js";
import LeiCoinNetNode from "../index.js";

type PipelineConstructor<T extends Pipeline = Pipeline> = new() => T;

export abstract class Pipeline {

    abstract readonly id: string;

    abstract receive(type: LNPPX, data: Uint): Promise<void>;
    
    async broadcast(type: LNPPX, data: Uint, ...args: any[]) {
        await LeiCoinNetNode.broadcast(LeiCoinNetDataPackage.create(type, data));
    }
}

export class Pipelines {

    // { "01xx": SomePipeline } , the x is used as a wildcard
    private static pipelines: { [id: string]: Pipeline } = {};

    static registerPipelines() {
        this.registerPipeline(BlockPipeline);
        this.registerPipeline(TransactionPipeline);
    }

    private static registerPipeline(CLS: PipelineConstructor) {
        const pipeline = new CLS();
        this.pipelines[pipeline.id] = pipeline;
    }

    static async receiveData(rawData: Buffer) {

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

        await this.pipelines[matchedPipelineId].receive(data.type, data.content);

    }

}

export default Pipelines;
