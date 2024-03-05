import cryptoHandlers from "../src/handlers/cryptoHandlers.js";
import encodingHandlers from "../src/handlers/encodingHandlers.js";
import crypto from "crypto"
import BigNum from "../src/utils/bigNum.js";
import fs from "fs";

export class Transaction {

    public txid: string;
    public senderAddress: string;
    public senderPublicKey: string;
    public recipientAddress: string;
    public amount: string;
    public nonce: string;
    public timestamp: string
    public message: string;
    public signature: string;
    public readonly version: string;

    constructor(txid: string, senderAddress: string, senderPublicKey: string, recipientAddress: string, amount: string, nonce: string, timestamp: string, message: string, signature: string, version = "00") {
        this.txid = txid;
        this.senderAddress = senderAddress;
        this.senderPublicKey = senderPublicKey;
        this.recipientAddress = recipientAddress;
        this.amount = amount;
        this.nonce = nonce;
        this.timestamp = timestamp;
        this.message = message;
        this.signature = signature;
        this.version = version;
    }

    public static createCoinbaseTransaction() {
        const coinbase = new Transaction(
            "",
            "lc0x6c6569636f696e6e65745f636f696e62617365",
            "",
            "lc0x01da74f8d1cf98760388643407cd1d4bc19f28",
            "100000",
            "0",
            new Date().getTime().toString(),
            "",
            "0000000000000000000000000000000000000000000000000000000000000000",
        );
        coinbase.txid = cryptoHandlers.createHash(coinbase, ["txid", "version"]);
        return coinbase;
    }

    public encodeToHex(add_empty_bytes = false) {

        const encoded_senderPublicKey = encodingHandlers.base64ToHex(this.senderPublicKey);
        const senderPublicKey_length = encoded_senderPublicKey.length.toString().padStart(3, "0");        
    
        const encoded_amount = encodingHandlers.compressZeros(this.amount.toString());
        const amount_length = encoded_amount.length.toString().padStart(2, "0");

        const encoded_nonce = encodingHandlers.compressZeros(this.nonce.toString());
        const nonce_length = encoded_nonce.length.toString().padStart(2, "0");

        const timestamp_length = this.timestamp.length.toString().padStart(2, "0");

        const encoded_message = encodingHandlers.base64ToHex(this.message);
        const message_length = encoded_message.length.toString().padStart(3, "0");

        const hexData = this.version +
                        this.txid +
                        encodingHandlers.encodeAddressToHex(this.senderAddress) +
                        senderPublicKey_length +
                        encoded_senderPublicKey +
                        encodingHandlers.encodeAddressToHex(this.recipientAddress) +
                        amount_length +
                        encoded_amount +
                        nonce_length +
                        encoded_nonce +
                        timestamp_length +
                        this.timestamp +
                        message_length +
                        encoded_message +
                        this.signature;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;

    }

    public static fromDecodedHex(hexData: string, returnLength = false) {

        try {
            const returnData = encodingHandlers.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "txid", length: 64},
                {key: "senderAddress", length: 40},
                {key: "senderPublicKey_length", length: 3},
                {key: "senderPublicKey", length: "senderPublicKey_length"},
                {key: "recipientAddress", length: 40},
                {key: "amount_length", length: 2},
                {key: "amount", length: "amount_length"},
                {key: "nonce_length", length: 2},
                {key: "nonce", length: "nonce_length"},
                {key: "timestamp_length", length: 2},
                {key: "timestamp", length: "timestamp_length"},
                {key: "message_length", length: 3},
                {key: "message", length: "message_length", decode: true},
                {key: "signature", length: 64}
            ], returnLength);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                data.senderAddress = encodingHandlers.decodeHexToAddress(data.senderAddress);
                data.senderPublicKey = encodingHandlers.hexToBase64(data.senderPublicKey);
                data.recipientAddress = encodingHandlers.decodeHexToAddress(data.recipientAddress);
                data.amount = encodingHandlers.decompressZeros(data.amount);
                data.nonce = encodingHandlers.decompressZeros(data.nonce);
                data.message = encodingHandlers.hexToBase64(data.message);

                const tx = createInstanceFromJSON(Transaction, data)

                if (returnLength) {
                    return {data: tx, length: returnData.lengh};
                }
                return tx;
            }
        } catch (err: any) {
        }

        return null;

    }

}

export class Block {

    public index: string;
    public hash: string;
    public previousHash: string;
    public timestamp: string;
    public nonce: string;
    public transactions: Transaction[];
    public readonly version: string;

    constructor(
        index: string,
        hash: string,
        previousHash: string,
        timestamp: string,
        nonce: string,
        transactions: Transaction[],
        version = "00"
    ) {

        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.transactions = transactions;
        this.version = version;

    }

    public static createNewBlock() {
        
        const coinbase = Transaction.createCoinbaseTransaction();

        const transactions: Transaction[] = [];
        for (let i = 0; i < 100; i++) transactions.unshift(coinbase);
    
        return new Block(
            "1000000",
            cryptoHandlers.createHash({1: "123"}),
            cryptoHandlers.createHash({1: "abc"}),
            new Date().getTime().toString(),
            "1000000000",
            transactions
        );

    }

    public encodeToHex(add_empty_bytes = true) {   
    
        const encoded_index = encodingHandlers.compressZeros(this.index);
        const index_length = encoded_index.length.toString().padStart(2, "0");

        const timestamp_length = this.timestamp.length.toString().padStart(2, "0");

        const encoded_nonce = encodingHandlers.compressZeros(this.nonce.toString());
        const nonce_length = encoded_nonce.length.toString().padStart(2, "0");

        let encoded_transactions = this.transactions.length.toString() + "E";

        for (let transaction of this.transactions) {
            encoded_transactions += transaction.encodeToHex();
        }

        const hexData = this.version +
                        index_length +
                        encoded_index +
                        this.hash +
                        this.previousHash +
                        timestamp_length +
                        this.timestamp +
                        nonce_length +
                        encoded_nonce + 
                        encoded_transactions;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;

    }

    public static fromDecodedHex(hexData: string) {

        try {
            const returnData = encodingHandlers.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "index_length", length: 2},
                {key: "index", length: "index_length"},
                {key: "hash", length: 64},
                {key: "previousHash", length: 64},
                {key: "timestamp_length", length: 2},
                {key: "timestamp", length: "timestamp_length"},
                {key: "nonce_length", length: 2},
                {key: "nonce", length: "nonce_length"},
                {key: "transactions", length: "", type: "array", arrayFunc: Transaction.fromDecodedHex}
            ]);

            const data = returnData.data;
        
            if (data && data.version === "00") {
                data.index = encodingHandlers.decompressZeros(data.index);
                data.nonce = encodingHandlers.decompressZeros(data.nonce);

                return createInstanceFromJSON(Block, data);
            }
        } catch (err: any) {
            //cli.data_message.error(`Error loading Block from Decoded Hex: ${err.message}`);
        }

        return null;
    }

    public static createCopy(block: Block) {
        //return Block.initFromJSON(block);
    }

    public calculateHash(modifyedBlock: {[key: string]: any}) {
        this.hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(modifyedBlock))
            .digest('hex');
    }

}

export class Wallet {

    public readonly owner: string;
    private balance: string;
    private nonce: string;
    public readonly version: string;

    constructor(owner: string, balance: string, nonce: string, verion = "00") {
        this.owner = owner;
        this.balance = balance;
        this.nonce = nonce;
        this.version = verion;
    }

    public static createEmptyWallet(owner: string) {
        return new Wallet(owner, "0", "0");
    }

    public encodeToHex(add_empty_bytes = true) {
    
        const encoded_balance = encodingHandlers.compressZeros(this.balance.toString());
        const balance_length = encoded_balance.length.toString().padStart(2, "0");
    
        const encoded_nonce = encodingHandlers.compressZeros(this.nonce.toString());
        const nonce_length = encoded_nonce.length.toString().padStart(2, "0");

        const hexData = this.version + 
                        balance_length + 
                        encoded_balance + 
                        nonce_length + 
                        encoded_nonce;

        const empty_bytes = (add_empty_bytes && (hexData.length % 2 !== 0)) ? "0" : "";
        
        return hexData + empty_bytes;
    
    }
    
    public static fromDecodedHex(ownerAddress: string, hexData: string) {

        try {

            const resultData = encodingHandlers.splitHex(hexData, [
                {key: "version", length: 2},
                {key: "balance_length", length: 2},
                {key: "balance", length: "balance_length"},
                {key: "nonce_length", length: 2},
                {key: "nonce", length: "nonce_length"},
            ]);

            const data = resultData.data;
        
            if (data && data.version === "00") {
                data.balance = encodingHandlers.decompressZeros(data.balance);
                data.nonce = encodingHandlers.decompressZeros(data.nonce);

                return new Wallet(ownerAddress, data.balance, data.nonce, data.version);
            }

        } catch (err: any) {
            //data_message.error(`Error loading Wallet from Decoded Hex: ${err.message}`);
        }

        return Wallet.createEmptyWallet(ownerAddress);
    }

    public addMoney(amount: string) {
        this.balance += amount;
    }

    public getBalance() {
        return this.balance;
    }

    public isSubtractMoneyPossible(amount: string) {
        if (BigNum.lessOrEqual(amount, this.balance)) {
            return true;
        }
        return false;
    }

    public subtractMoneyIFPossible(amount: string) {

        if (this.isSubtractMoneyPossible(amount)) {
            this.balance = BigNum.subtract(this.balance, amount);
        }
    }

    public getNonce() {
        return this.nonce;
    }

    public adjustNonce() {
        this.nonce = BigNum.add(this.nonce, "1");
    }

}

interface Constructable<T> {
    new (...args: any[]): T;
}


function createInstanceFromJSON<T>(cls: Constructable<T>, json: any): T {
    // Retrieve the constructor of the class
    const constructor = cls as any;

    // Retrieve the parameter names of the constructor
    const paramNames = constructor.toString().match(/\(([^)]+)\)/)?.[1].split(',').map((param: string) => param.trim()) || [];

    // Create an array of arguments for the constructor
    const args = paramNames.map((paramName: string) => json[paramName]);

    // Instantiate the class with the arguments
    const instance = Reflect.construct(cls, args);

    // Return the instance
    return instance;
}

describe('Encoding Testing', () => {
    test('Test Transaction Enoding And Decoding', () => {
        const tx = Transaction.createCoinbaseTransaction();
        const encoded = tx.encodeToHex();
        const decoded: any = Transaction.fromDecodedHex(encoded);

        expect(JSON.stringify(tx)).toBe(JSON.stringify(decoded));
    });
    test('Test Wallet Enoding And Decoding', () => {

        const wallet = new Wallet("lc0x6c6569636f696e6e65745f636f696e62617365", "10000000000000", "10000000");

        const decoded = Wallet.fromDecodedHex("lc0x6c6569636f696e6e65745f636f696e62617365", wallet.encodeToHex());

        const decoded2 = Wallet.fromDecodedHex("lc0x6c6569636f696e6e65745f636f696e62617365", decoded.encodeToHex());

        expect(JSON.stringify(wallet)).toBe(JSON.stringify(decoded2));
    });
    test('Block Enoding And Decoding', () => {

        const block = Block.createNewBlock();

        const decoded: any = Block.fromDecodedHex(block.encodeToHex());

        const decoded2: any = Block.fromDecodedHex(decoded.encodeToHex());

        //fs.writeFileSync("./blockchain_data/test.dat", decoded2.encodeToHex(), {encoding: "hex", flag: "w"});

        expect(JSON.stringify(block)).toBe(JSON.stringify(decoded2));
    });
});