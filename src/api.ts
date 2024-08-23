import { type HTTP_API } from "./http_api";
import { type LeiCoinNetNode } from "./leicoin-net";
import { type MinterClient } from "./minter";
import { type POS } from "./pos";
import { type Blockchain } from "./storage/blockchain";

export interface APICompatibleConstructor {
    new(api: APILike): APICompatible;
}

export interface APICompatible {}



export class API {

    public Blockchain: Blockchain | null = null;
    public net: LeiCoinNetNode | null = null;
    public http_api: HTTP_API | null = null;
    public Minters: MinterClient[] | null = null;
    public POS: POS | null = null;

    constructor() {}

}

export type APILike = API;

export default API;
