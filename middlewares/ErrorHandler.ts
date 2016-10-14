import express = require('express');
import {Logger}  from "../Logger";
import {CLError}  from "../CLError";
import {APIResponse} from "../APIResponse";
import {ErrorCode} from "../ErrorCode";

export function errorHandler(err, req: express.Request, res: express.Response, next) {
   // Logger.log.info('error handler called.');
    Logger.log.error(err.stack);
    //delete err.stack;    
    let clRes: APIResponse;
    clRes = { error: { errorCode:err.errorCode, statusCode:err.statusCode, message:err.message}  , isValid: false }
    res.send(clRes);
}