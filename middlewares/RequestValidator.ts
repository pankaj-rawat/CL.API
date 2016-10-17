import ld = require('lodash');
import jwt = require('jwt-simple');
import {AuthRepository} from "../repositories/AuthRepository";
import {UserRepository} from "../repositories/UserRepository";
import config = require('config');
import *  as model from "../models/AuthModel";
import {Role} from "../Definitions";
import express = require('express');
import {Logger}  from "../Logger";
import {APIResponse} from "../APIResponse";
import * as CLError from "../CLError";
import {ErrorCode} from "../ErrorCode";

export class RequestValidator {

    Validate(req: express.Request, res: express.Response, next: Function) {
        // When performing a cross domain request, you will recieve
        // a preflighted request first. This is to check if the app
        // is safe. 
        // We skip the token outh for [OPTIONS] requests.
        if (req.method == 'OPTIONS') return next();
        if ((req.url.indexOf('api/connect') >= 0)) return next(); // public route

        const httpStatus_BADREQUEST = 400;
        const httpStatus_FORBIDDEN = 403;
        const httpStatus_UNAUTHORIZED = 401;
        const httpStatus_INTERNALSERVERERROR = 500;
        const unsecuredRoutes: string[] = ['api/connect'];//public route... need to use this for list

        let clientToken = (req.body && req.body.client_token) || (req.query && req.query.client_token) || req.headers['x-client-token'];
        let clientKey = (req.body && req.body.client_key) || (req.query && req.query.client_key) || req.headers['x-client-key'];

        if (clientToken == null || clientKey == null) {
            return next(new CLError.Forbidden(ErrorCode.CLIENT_IDENTIFICATION_MISSING, "Missing client credentials."));
        }

        //verify that client is known to us.
        let decoded = jwt.decode(clientToken, String(process.env.TOKEN_KEY || config.get("token.key")));

        if (decoded.client != clientKey) {
            return next(new CLError.Unauthorized(ErrorCode.INVALID_CLIENT_KEY, "Authentication failed. Client is not valid."));
        }

        if (new Date(decoded.exp).getTime() <= (new Date()).getTime()) {
            //res.status(httpStatus_BADREQUEST);
            //Logger.log.info('Response:  ' +httpStatus_BADREQUEST);
            //res.json({
            //    "status": httpStatus_BADREQUEST,
            //    "message": "clientToken Expired"
            //});
            //Autorefresh client for time being
            let clRes: APIResponse;
            let authrepo = new AuthRepository();
            authrepo.connect(decoded.id, undefined, decoded.client)
                .then(function (result: model.AuthModel) {
                    clRes = { data: result, isValid: false };
                    res.send(clRes);
                })
                .catch(function (error) {
                    next(error);
                });
            return;
        }

          //check for public URL not required users to log in.
        if ((req.url.indexOf('api/users/login') >= 0)
            || (req.url.indexOf('api/search') >= 0)
            || (req.url.indexOf('api/cities') >= 0)
            || (req.url.indexOf('api/states') >= 0)
            || (req.url.indexOf('api/countries') >= 0)
            || (req.url.indexOf('api/categories') >= 0)
            || (req.url.indexOf('api/tags') >= 0)
            || (req.url.indexOf('api/businesses') >= 0)
            || (req.url.indexOf('api/registrationplans') >= 0)
            || (req.url.indexOf('api/users/signup') >= 0)) {
            return next();
        }

        let token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
        let key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

        if (token == null || key == null) {
            return next(new CLError.Forbidden(ErrorCode.USER_IDENTIFICATION_MISSING, "Missing User information."));
        }

        //verify that user session token
        let userDecoded = jwt.decode(token, String(process.env.TOKEN_KEY || config.get("token.key")));
        if (new Date(userDecoded.exp).getTime() <= (new Date()).getTime()) {
            return next(new CLError.Unauthorized(ErrorCode.USER_TOKEN_EXPIRED, 'Token expired.'));
        }

        if (userDecoded.id != key) {
            return next(new CLError.Unauthorized(ErrorCode.INVALID_USER_TOKEN, "Authentication failed. Token not valid."));
        }

        //verify that some user must logged in to procede further
        let userRepo = new UserRepository();
        // The key would be the logged in user's username
        userRepo.getUserRoles(key)
            .then(function (userRoles) {
                if (!ld.includes(userRoles, Role.RegisteredUser)) {
                    return next(new CLError.Forbidden(ErrorCode.USER_NOT_AUTHORIZED, ' User not authorized.'));
                }
                next();
            })
            .catch(function(err){
            return next(err);
        });
    };
}