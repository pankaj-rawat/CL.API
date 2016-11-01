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


export class RequestValidator {

    Validate(req: express.Request, res: express.Response, next: Function) {
        // When performing a cross domain request, you will recieve
        // a preflighted request first. This is to check if the app
        // is safe. 
        // We skip the token auth for [OPTIONS] requests.
        Logger.log.info('Request recieved: ' + req.originalUrl);
        if (req.method == 'OPTIONS') return next();

        let reqURL: string = req.url.toLowerCase();
        if ((reqURL.indexOf('api/connect') >= 0)) return next(); // public route

        let clientToken = req.headers['x-client-token'] || (req.query && req.query.client_token) || (req.body && req.body.client_token);
        let clientKey = req.headers['x-client-key'] || (req.query && req.query.client_key) || (req.body && req.body.client_key);

        if (clientToken == null || clientKey == null) {
            return next(new CLError.Forbidden(CLError.ErrorCode.CLIENT_IDENTIFICATION_MISSING));
        }

        //verify that client is known to us.
        let decoded = jwt.decode(clientToken, String(process.env.TOKEN_KEY || config.get("token.key")));

        if (decoded.client != clientKey) {
            return next(new CLError.Unauthorized(CLError.ErrorCode.INVALID_CLIENT_KEY));
        }

        if (new Date(decoded.exp).getTime() <= (new Date()).getTime()) {
            //Autorefresh client
            let clRes: APIResponse;
            let authrepo = new AuthRepository();
            authrepo.connect(decoded.id, undefined, decoded.client)
                .then(function (result: model.AuthModel) {
                    res.setHeader('Client-Token', result.token);
                    validateUser(req, res, next);
                })
                .catch(function (error) {
                    return next(error);
                });
        }
        else {
            validateUser(req, res, next);
        }
    };
}

function validateUser(req: express.Request, res: express.Response, next: Function) {
    //check for public URL not required users to log in.
    let reqURL: string = req.url.toLowerCase();
    if (
        (reqURL.indexOf('api/users/login') >= 0)
        || (reqURL.indexOf('api/users/logout') >= 0)
        || (reqURL.indexOf('api/users/signup') >= 0)
        || (reqURL.indexOf('api/search') >= 0)
        || (reqURL.indexOf('api/cities') >= 0)
        || (reqURL.indexOf('api/states') >= 0)
        || (reqURL.indexOf('api/countries') >= 0)
        || (reqURL.indexOf('api/categories') >= 0)
        || (reqURL.indexOf('api/tags') >= 0)
        || (reqURL.indexOf('api/businesses') >= 0)
        || (reqURL.indexOf('api/registrationplans') >= 0)
        ) {
        return next();
    }

    let token = (req.query && req.query.access_token) || req.headers['x-access-token'];
    let key = (req.query && req.query.key) || req.headers['x-key'];
    let location = (req.query && req.query.location) || req.headers['x-location'];

    if (token == null || key == null || location == null) {
        return next(new CLError.Forbidden(CLError.ErrorCode.USER_IDENTIFICATION_MISSING));
    }

    //verify that user session token
    let userDecoded = jwt.decode(token, String(process.env.TOKEN_KEY || config.get("token.key")));
    if (new Date(userDecoded.exp).getTime() <= (new Date()).getTime()) {
        return next(new CLError.Forbidden(CLError.ErrorCode.USER_TOKEN_EXPIRED));
    }

    if (userDecoded.id != key) {
        return next(new CLError.Forbidden(CLError.ErrorCode.INVALID_USER_TOKEN));
    }

    //verify that user must logged in to procede further
    let userRepo = new UserRepository();
    // The key would be the logged in user's username
    userRepo.getUserRoles(key)
        .then(function (userRoles) {
            if (!ld.includes(userRoles, Role.RegisteredUser)) {
                return next(new CLError.Forbidden(CLError.ErrorCode.USER_NOT_AUTHORIZED));
            }
            //add refreshed acess token on response header with new expiration time
            let authrepo = new AuthRepository();

            // verify whther we can refresh the token or not for the case like- pwd might got changed after last login or force logout.
            let clientLocation = req.headers['x-location'] || (req.query && req.query.location);
            authrepo.refreshAccessToken(userDecoded.id, clientLocation)
                .then(function (result: model.AuthModel) {
                    res.setHeader("Access-Token", result.token);
                    res.setHeader("Access-Token-Expiry", result.expires.toJSON());
                    next();
                })
                .catch(function (err) {
                    return next(err);
                });
        })
        .catch(function (err) {
            return next(err);
        });
}