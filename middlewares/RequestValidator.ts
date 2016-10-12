import ld = require('lodash');
import jwt = require('jwt-simple');
import {AuthRepository} from "../repositories/AuthRepository";
import config = require('config');
import *  as model from "../models/AuthModel";
import {Role} from "../Definitions";
import express = require('express');
import {Logger}  from "../Logger";
import {APIResponse} from "../APIResponse";
import * as CLError from "../CLError";

export class RequestValidator {

    Validate(req:express.Request, res:express.Response, next:Function) {
        // When performing a cross domain request, you will recieve
        // a preflighted request first. This is to check if the app
        // is safe. 
        // We skip the token outh for [OPTIONS] requests.
        if(req.method == 'OPTIONS') return next();
        if ((req.url.indexOf('api/connect') >= 0)) return next(); // public route

        const httpStatus_BADREQUEST = 400;
        const httpStatus_FORBIDDEN = 403;
        const httpStatus_UNAUTHORIZED = 401;
        const httpStatus_INTERNALSERVERERROR = 500;
        const unsecuredRoutes: string[] = ['api/connect'];//public route... need to use this for list

        let clientToken = (req.body && req.body.client_token) || (req.query && req.query.client_token) || req.headers['x-client-token'];
        let clientKey = (req.body && req.body.client_key) || (req.query && req.query.client_key) || req.headers['x-client-key'];      

        if (clientToken == null || clientKey == null) {
            let error: CLError.Forbidden = new CLError.Forbidden(httpStatus_FORBIDDEN,"Missing client credentials.");
            return next(error);
        }

        if (clientToken!=null && clientKey!=null) {
            //verify that client is known to us.
            let decoded = jwt.decode(clientToken, String(process.env.TOKEN_KEY || config.get("token.key")));
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
                let response: Promise<model.AuthModel> = authrepo.connect(decoded.id, undefined, decoded.client);
                response.then(function (result: model.AuthModel) {
                    try {
                        clRes = { data: result, isValid: false };
                        res.send(clRes);
                    }
                    catch (error) {
                        Logger.log.error(error.message);
                        clRes = { error: { message: "Auto refresh fail.", number: error.code }, isValid: false }
                        res.send(clRes);
                    }
                });
                response.catch(function (error) {
                    try {
                        Logger.log.error(error.message);
                        clRes = { message: "Failed to connect.", isValid: false }
                        res.send(clRes);
                    }
                    catch (error) {
                        clRes = { message: "Failed to connect.", isValid: false }
                        res.send(clRes);
                    }
                });
                return;
            }
            if (decoded.client != clientKey) {
                res.status(httpStatus_UNAUTHORIZED);
                Logger.log.info('Response:  ' + httpStatus_UNAUTHORIZED);
                res.json({
                    "status": httpStatus_UNAUTHORIZED,
                    "message": "Client not authorized."
                });
                return;
            }

            let token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
            let key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

            //check for public URL not required users to log in.
            if ((req.url.indexOf('api/login') >= 0)
                || (req.url.indexOf('api/search') >= 0)
                || (req.url.indexOf('api/cities') >= 0)
                || (req.url.indexOf('api/states') >= 0)
                || (req.url.indexOf('api/countries') >= 0)
                || (req.url.indexOf('api/categories') >= 0)
                || (req.url.indexOf('api/tags') >= 0)
                || (req.url.indexOf('api/businesses') >= 0)
                || (req.url.indexOf('api/registrationplans') >= 0)
                || (req.url.indexOf('api/users/signup') >= 0)) {
                next();
            } else if (token || key) {
                //verify that some user must logged in to procede further
                let authRepo = new AuthRepository();
                // The key would be the logged in user's username
                authRepo.validateUser(key, function (userRoles) {
                    if (userRoles) {
                        if (ld.includes(userRoles, Role.RegisteredUser)) {
                            //TODO: need to implement role based. For the time being hardcoded for Role.RegisteredUser
                            next(); // To move to next middleware
                        }
                        else {
                            res.status(httpStatus_FORBIDDEN);
                            Logger.log.info('Response:  ' + httpStatus_FORBIDDEN);
                            res.json({
                                "status": httpStatus_FORBIDDEN,
                                "message": "Not Authorized"
                            });
                            return;
                        }
                    } else {
                        // No user with this name exists, respond back with a 401
                        res.status(httpStatus_UNAUTHORIZED);
                        Logger.log.info('Response:  ' + httpStatus_UNAUTHORIZED);
                        res.json({
                            "status": httpStatus_UNAUTHORIZED,
                            "message": "Invalid User"
                        });
                        return;
                    }

                });
            } else {
                res.status(httpStatus_UNAUTHORIZED);
                Logger.log.info('Response:  ' + httpStatus_UNAUTHORIZED);
                res.json({
                    "status": httpStatus_UNAUTHORIZED,
                    "message": "Not authorized."
                });
                return;
            }
        } else {
            res.status(httpStatus_UNAUTHORIZED);
            Logger.log.info('Response:  ' + httpStatus_UNAUTHORIZED);
            res.json({
                "status": httpStatus_UNAUTHORIZED,
                "message": "Invalid Token or Key"
            });
            return;
        }
    };
}