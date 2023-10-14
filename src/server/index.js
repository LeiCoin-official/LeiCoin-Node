const express = require('express');
const bodyParser = require('body-parser');
const config = require('../handlers/configHandler');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const transactionRouter = require('./routes/sendTransactions')
const blocksRouter = require('./routes/sendBlocks');

app.use('/sendtransactions', transactionRouter);
app.use('/sendblocks', blocksRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(config.server.port, () => {
    console.log(`App listening on port ${config.server.port}`);
});
