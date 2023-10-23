const express = require('express');
const router = express.Router();

// Route for api
router.ws('/', (req, res, next) => {

    res.status(200);
	res.json({ message: "" });

});

router.use('/sendtransactions', require('./sendTransactions'));
//router.use('/sendblocks', require('./sendBlocks'));

module.exports = router;