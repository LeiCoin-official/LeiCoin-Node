const express = require('express');
const data = require('../../../handlers/dataHandler');
const router = express.Router();

// Route for receiving new transactions
router.use('/', (req, res, next) => {

    if (req.method !== 'GET') {
        res.status(405);
        res.json({ message: 'Method Not Allowed. Use GET instead' });
        return;
    }

	const address = req.query.address;
	
	// Validate the transaction (add your validation logic here)
	const utxos_reading_result = data.readUTXOS(address, txid, index);

	if (utxos_reading_result.cb !== "sucess") {
		if (utxos_reading_result.cb === "none") {
            res.status(400);
            if (txid === null && index === 0) {
                res.json({ message: "Bad Request. Address does not have UTXOS." });
                return;
            }
            res.json({ message: "Bad Request. UTXO was not found for the specified address." });
            return;
        }
        res.status(500);
        res.json({ message: "Internal Server Error. UTXOS could not be read for the given data." });
        return;
	}

    res.status(200);
    res.json({ data: utxos_reading_result.data });
    return;

});

// Replace this function with your actual transaction validation logic

module.exports = router;