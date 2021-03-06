﻿import https = require('https');
import * as DB from "./DB";
import config = require('config');
import {Logger}  from "./Logger";

//make 'production' for production here or set the environment variable.
let environment = process.env.NODE_ENV || 'development';
let server:https.Server = require("./Server");
let port: string;
port = process.env.PORT || config.get('server.port'); //set our port


DB.connect(environment, function (err) {
    if (err) {
        Logger.log.error(err.message);
        Logger.log.error(err.stack);
        process.exit(1)
    } else {
        server.listen(port, function () {
            Logger.log.info('CL api listening at Port:' + port);
        })
    }
})


/* Test code */
/*
var http = require("http"),
    port = process.env.PORT || 1377;

var server = http.createServer(function (request, response) {
    response.writeHeader(200, { "Content-Type": "text/plain" });
    response.write("Hello HTTP!");
    response.end();
});
server.listen(port);
*/