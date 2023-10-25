const express = require('express');
const expressWS = require('express-ws');
const bodyParser = require('body-parser');
const config = require('../handlers/configHandler');
const cors = require('cors');
const util = require('../utils');

const app = express();

expressWS(app);

app.use(cors());
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use("/api", require('./routes/api'));

app.use("/ws", require('./routes/ws'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const server = app.listen(config.server.port, () => {
    util.server_message.log(`Server listening on port ${config.server.port}`);
});

util.events.on("stop_server", function() {
    util.server_message.log(`Server stopped`);
    server.close();
});