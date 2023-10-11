const express = require('express');
const bodyParser = require('body-parser');
const util = require("../util.js");

const app = express();
app.use(bodyParser.json());

const transactionRouter = require('./routes/transactions.js')

app.use('/transactions', transactionRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(util.config.port, () => {
    console.log(`App listening on port ${util.config.port}`);
});
