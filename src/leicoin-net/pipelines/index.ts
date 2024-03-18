import { LeiCoinNetDataPackage, LeiCoinNetDataPackageType } from "../../objects/leicoinnet.js";
import Staker from "../../objects/staker.js";
import { Callbacks } from "../../utils/callbacks.js";
import validator from "../../validators/index.js";
import BlockPipeline from "./blocks.js";
import TransactionPipeline from "./transactions.js";
import ValidatorPipeline from "./validators.js";

export interface PipelineLike {
    receive(type: LeiCoinNetDataPackageType, data: string): any;
    broadcast(rawData: Buffer): any;
}

export class Pipelines {

    private static instance: Pipelines | null = null;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }

    private pipelines: { [id: string]: PipelineLike } = {
        "0001": BlockPipeline,
        "0002": TransactionPipeline,
        "01xx": ValidatorPipeline,
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
            return { cb: Callbacks.NONE, message: `Unknown Data Type: ${data.type}` };
        }

        const receiveResult = await this.pipelines[data.type].receive(data.type, data.content);

        if (receiveResult.cb) {
            await this.pipelines[data.type].broadcast(rawData);
        }

    }

}

const pipelines = Pipelines.getInstance()
export default pipelines;
