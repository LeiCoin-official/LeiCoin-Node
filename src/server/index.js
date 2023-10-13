const express = require('express');
const bodyParser = require('body-parser');
const config = require('../handlers/configHandler');

const app = express();
app.use(bodyParser.json());

const transactionRouter = require('./routes/sendTransactions')
const blocksRouter = require('./routes/sendBlocks');

app.use('/sendtransactions', transactionRouter);
app.use('/sendblocks', transactionRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(config.server.port, () => {
    console.log(`App listening on port ${config.server.port}`);
});
