//import https = require('https');
import http = require('http');
import express = require('express');
import fs = require('fs');
import bodyParser = require('body-parser');
import {Logger}  from "./Logger";
import {RequestValidator} from './middlewares/RequestValidator';
import {RouteBuilder} from './RouteBuilder';
import {errorHandler} from './middlewares/ErrorHandler';

var app = express();
var router = new RouteBuilder();
var validateRequest = new RequestValidator();
let key = fs.readFileSync('ssl_cert/key.pem');
let cert = fs.readFileSync('ssl_cert/cert.pem');

let httpsServerOption = {
    cert: cert,
    key: key
};

//enable CORS
app.use(function (req: express.Request, res: express.Response, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-token,x-client-key,x-access-token,x-key");
    next();
});

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.all('/api/*', validateRequest.Validate);
//load router
router.build(app);
app.use(errorHandler);
process.on('unhandledRejection', (reason: string, p) => {
    Logger.log.error(reason);
});
process.on('uncaughtException', (reason: string, p) => {
    Logger.log.error(reason);
});
//module.exports = https.createServer(httpsServerOption, app);
module.exports = http.createServer(app);
