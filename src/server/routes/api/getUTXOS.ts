import express from "express";
import  from "../../../handlers/dataHandler.js";
const router = express.Router();

// Route for receiving new transactions
router.use('/', (req, res, next) => {

    if (req.method !== 'GET') {
        res.status(405);
        res.json({ message: 'Method Not Allowed. Use GET instead' });
        return;
    }

    const address = req.query.address;
    const txid = req.query.txid || null; // Set to null if not provided
    const index = req.query.index || null; // Set to null if not provided

    // Check if the address is provided
    if (!address) {
        res.status(400);
        res.json({ message: 'Bad Request. Address is required.' });
        return;
    }

    // Validate the transaction (add your validation logic here)
    const utxos_reading_result = readUTXOS(address, txid, index);

    if (utxos_reading_result.cb !== 'success') {
        if (utxos_reading_result.cb === 'none') {
            res.status(400);
            if (!txid && !index) {
                res.json({ message: 'Bad Request. Address does not have UTXOs.' });
                return;
            }
            res.json({ message: 'Bad Request. UTXO was not found for the specified address.' });
            return;
        } 
        res.status(500);
        res.json({ message: 'Internal Server Error. UTXOs could not be read for the given data.' });
        return; 
    }
    res.status(200);
    res.json({ data: utxos_reading_result.data });
    return;
});

const getUTXOS_route = router;
export default getUTXOS_route;