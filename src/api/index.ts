import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import getUTXOS_router from "./getUTXOS.js";
import sendTransactions_router from "./sendTransactions.js";

export default function initAPI() {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());
    
    app.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    
    app.use('/', (req, res, next) => {
        res.status(200);
        res.json({ message: "Online" });
    });
    
    app.use('/sendtransactions', sendTransactions_router);
    app.use('/getutxos', getUTXOS_router);

    return app;
}

