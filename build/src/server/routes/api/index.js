import express from 'express';
const router = express.Router();
// Route for api
router.use('/', (ws, res, next) => {
    res.status(200);
    res.json({ message: "Online" });
});
router.use('/sendtransactions', require('./sendTransactions'));
router.use('/getutxos', require('./getUTXOS'));
//router.use('/sendblocks', require('./sendBlocks'));
module.exports = router;
