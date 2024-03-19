
export interface PropositionLike {
    publicKey: string;
    nonce: string;
    signature: string;
}

export class Proposition implements PropositionLike {
    
    public readonly publicKey: string;
    public readonly nonce: string;
    public readonly signature: string;

    constructor(publicKey: string, nonce: string,signature: string) {
        this.publicKey = publicKey;
        this.nonce = nonce;
        this.signature = signature;
    }

}

export default Proposition;