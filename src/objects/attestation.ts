

export interface AttestationLike {
    publicKey: string;
    signature: string
}

export class Attestation implements AttestationLike {
    
    public readonly publicKey: string;
    public readonly signature: string;

    constructor(publicKey: string, signature: string) {
        this.publicKey = publicKey;
        this.signature = signature;
    }

}

export default Attestation;