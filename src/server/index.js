const express = require('express');
const bodyParser = require('body-parser');
const config = require('../handlers/configHandler');
const cors = require('cors');
const util = require('../utils');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const transactionRouter = require('./routes/sendTransactions')
const blocksRouter = require('./routes/sendBlocks');

app.use('/sendtransactions', transactionRouter);
app.use('/sendblocks', blocksRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(config.server.port, () => {
    util.server_message.log(`Server listening on port ${config.server.port}`);
});
