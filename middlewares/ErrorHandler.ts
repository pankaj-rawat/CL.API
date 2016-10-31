import express = require('express');
import {Logger}  from "../Logger";
import {APIResponse} from "../APIResponse";
import {ErrorCode} from "../ErrorCode";
import {UserRepository} from  "../repositories/UserRepository";

export function errorHandler(err, req: express.Request, res: express.Response, next) {
    Logger.log.error(err.stack);

    if (err.errorCode == ErrorCode.USER_TOKEN_EXPIRED) {
        //logout user.
        let urepo: UserRepository = new UserRepository();
        let userId = Number.parseInt(req.headers['x-key'] || (req.query && req.query.key));
        let userLocation = req.headers['x-location'] || (req.query && req.query.location);
        urepo.logout(userId, userLocation)
            .then(function (isLoggedOut: boolean) { respond(err, res); })
            .catch(function (er) { respond(err, res); });
    }
    else {
        respond(err, res);
    }
}

function respond(err: any, res: express.Response) {
    //delete err.stack;   
    let clRes: APIResponse;
    clRes = { error: { errorCode: err.errorCode, statusCode: err.statusCode, message: err.message }, isValid: false }
    res.send(clRes);
}