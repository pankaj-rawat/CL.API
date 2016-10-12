import express = require('express');
import {Logger}  from "../Logger";
import {CLError}  from "../CLError";
import {APIResponse} from "../APIResponse";

export function errorHandler(err, req: express.Request, res: express.Response, next) {
    let apiResponse: APIResponse;
    console.log('error handler called.');
    Logger.log.error(err);
    Logger.log.info(err.message);
    apiResponse = {
        isValid: false
        , error: err
    };
    return next(err,err,err);
}