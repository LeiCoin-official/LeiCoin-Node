import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import { Uint } from "../../utils/binary.js";
import { CB } from "../../utils/callbacks.js";
import BlockPipeline from "./blocks.js";
import TransactionPipeline from "./transactions.js";

export interface PipelineLike {
    receive(type: LeiCoinNetDataPackageType, data: Uint): Promise<void>;
    broadcast(type: LeiCoinNetDataPackageType, data: Uint, ...args: any[]): Promise<void>;
}

export class Pipelines {

    private static instance: Pipelines;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }

    private pipelines: { [id: string]: PipelineLike } = {
        "0001": BlockPipeline,
        "0002": TransactionPipeline,
        //"01xx": SomePipeline, the x is used as a wildcard
    };

    public async receiveData(rawData: Buffer) {

        const data = LeiCoinNetDataPackage.extract(rawData);

        let matchedPipelineId: string | undefined;
        for (const id in this.pipelines) {
            if (new RegExp(`^${id.replace(/x/g, ".")}$`).test(data.type)) {
                matchedPipelineId = id;
                break;
            }
        }

        if (!matchedPipelineId) {
            return { cb: CB.NONE, message: `Unknown Data Type: ${data.type}` };
        }

        await this.pipelines[data.type].receive(data.type, data.content);

    }

}

const pipelines = Pipelines.getInstance();
export default pipelines;
