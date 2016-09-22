import https = require('https');
import express = require('express');
import fs = require('fs');
import bodyParser = require('body-parser');
import {Logger}  from "./Logger";
import {RequestValidator} from './middlewares/RequestValidator';
import {RouteBuilder} from './RouteBuilder';

var app = express();
var router = new RouteBuilder();
var validateRequest = new RequestValidator();
let key = fs.readFileSync('ssl_cert/key.pem');
let cert = fs.readFileSync('ssl_cert/cert.pem');

let httpsServerOption = {
    cert : cert,
    key : key
};


// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.all('/api/*', validateRequest.Validate);
//load router
router.build(app);
process.on('unhandledRejection', (reason,p) => {
    Logger.log.error(reason);
});
process.on('uncaughtException', (reason, p) => {
    Logger.log.error(reason);
});
module.exports = https.createServer(httpsServerOption, app);
