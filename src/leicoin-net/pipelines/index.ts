import { LeiCoinNetDataPackage, type LNPPX } from "../packages.js";
import { type Uint } from "../../binary/uint.js";
import { CB } from "../../utils/callbacks.js";
import BlockPipeline from "./blocks.js";
import TransactionPipeline from "./transactions.js";
import { type LeiCoinNetBroadcaster } from "../index.js";

type PipelineConstructor<T extends Pipeline = Pipeline> = new (broadcaster: LeiCoinNetBroadcaster) => T;

export abstract class Pipeline {

    abstract readonly id: string;

    constructor(
        protected readonly broadcaster: LeiCoinNetBroadcaster
    ) {}

    abstract receive(type: LNPPX, data: Uint): Promise<void>;
    
    async broadcast(type: LNPPX, data: Uint, ...args: any[]) {
        await this.broadcaster(LeiCoinNetDataPackage.create(type, data));
    }
}

export class Pipelines {

    // { "01xx": SomePipeline } , the x is used as a wildcard
    private pipelines: { [id: string]: Pipeline } = {};

    constructor(
        protected readonly broadcaster: LeiCoinNetBroadcaster
    ) {
        this.registerPipelines([
            BlockPipeline,
            TransactionPipeline
        ]);
    }

    protected registerPipelines(CLSs: PipelineConstructor[]) {
        for (const CLS of CLSs) {
            this.registerPipeline(CLS);
        }
    }

    protected registerPipeline(CLS: PipelineConstructor) {
        const pipeline = new CLS(this.broadcaster);
        this.pipelines[pipeline.id] = pipeline;
    }

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

        await this.pipelines[matchedPipelineId].receive(data.type, data.content);

    }

}

export default Pipelines;
