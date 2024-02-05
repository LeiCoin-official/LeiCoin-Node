var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Worker, isMainThread } from "worker_threads";
import util from '../utils'.default;
import config from '../handlers/configHandler';
import { writeBlock, updateLatestBlockInfo, clearMempool, addUTXOS, deleteUTXOS } from '../handlers/dataHandler';
import validation from '../validation';
const numberOfThreads = config.miner.number_of_threads; // Adjust this to the number of threads you need.
function runInMiningParallel() {
    return __awaiter(this, void 0, void 0, function* () {
        const workerThreads = [];
        let results = new Array(numberOfThreads).fill(null);
        const promises = Array.from({ length: numberOfThreads }, (_, i) => new Promise((resolve) => {
            const worker = new Worker(util.processRootDirectory + '/src/miner/mine.js', { workerData: { threadIndex: i } });
            workerThreads.push(worker);
            worker.on('message', (data) => {
                util.miner_message.log(`Miner mined block with hash ${data.hash}. Waiting for verification`);
                results[i] = data;
                resolve(data);
            });
            worker.on('error', (error) => {
                // Handle worker errors if needed.
                util.miner_message.error('Mining Worker Error:', error);
                resolve(null);
            });
            worker.on('exit', (code) => {
                // if (code !== 0) {
                //   console.error(`Mining Worker ${i} exited with code ${code}`);
                //   resolve(null);
                // }
                resolve(null);
            });
        }));
        const blockResult = yield Promise.race(promises);
        // Terminate all worker threads.
        for (const worker of workerThreads) {
            worker.terminate();
        }
        return { results, blockResult };
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const { results, blockResult } = yield runInMiningParallel();
            if (blockResult !== null) {
                const winnerIndex = results.findIndex((result) => result === blockResult);
                afterMiningLogic(blockResult);
            }
            // Sleep for a while before starting the next iteration.
            yield new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the delay as needed.
        }
    });
}
function afterMiningLogic(blockResult) {
    if (validation.isValidBlock(blockResult).cb) {
        writeBlock(blockResult);
        updateLatestBlockInfo(blockResult.index, blockResult.hash);
        clearMempool(blockResult);
        addUTXOS({ txid: blockResult.hash, index: 0, recipientAddress: blockResult.coinbase.minerAddress, amount: blockResult.coinbase.amount }, true);
        for (const [, transactionData] of Object.entries(blockResult.transactions)) {
            deleteUTXOS(transactionData);
            addUTXOS(transactionData, false);
        }
        util.events.emit('block_receive', JSON.stringify({ type: "block", data: blockResult }));
        util.miner_message.success(`Mined block with hash ${blockResult.hash} has been validated. Broadcasting now.`);
    }
    else {
        util.miner_message.error(`Mined block with hash ${blockResult.hash} is invalid.`);
    }
}
if (isMainThread && config.miner.active) {
    main();
}
