import ld = require('lodash');
import jwt = require('jwt-simple');
import {AuthRepository} from "../repositories/AuthRepository";
import config = require('config');
import *  as model from "../models/AuthModel";
import * as def from "../Definitions";
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
        if ((reqURL.indexOf('auth/connect') >= 0)) return next(); // public route

        let clientToken = req.headers['clapi-client-token'] || (req.query && req.query.client_token);
        let clientKey = req.headers['clapi-client-key'] || (req.query && req.query.client_key);

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
                    res.setHeader('CLAPI-Client-Token', result.token);
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
    let token = req.headers['clapi-user-access-Token'] || (req.query && req.query.user_access_token);
    let key = req.headers['clapi-user-key'] || (req.query && req.query.user_key) ;
    let location = req.headers['clapi-user-location'] || (req.query && req.query.user_location);
    let reqURL: string = req.url.toLowerCase();

    //if none of the user specific param exists, check for guest
    if (token == null && key == null) {
        let roles: Array<def.Role> = new Array<def.Role>();
        roles.push(def.Role.Guest);
        checkRoleAccess(roles, req, next);
    }
    else {
        //check for all required params.
        if (token == null || key == null || location == null) {
            return next(new CLError.Unauthorized(CLError.ErrorCode.USER_IDENTIFICATION_MISSING));
        }

        let userDecoded = jwt.decode(token, String(process.env.TOKEN_KEY || config.get("token.key")));
        if (new Date(userDecoded.exp).getTime() <= (new Date()).getTime()) {
            return next(new CLError.Unauthorized(CLError.ErrorCode.USER_TOKEN_EXPIRED));
        }
        if (userDecoded.id != key) {
            return next(new CLError.Unauthorized(CLError.ErrorCode.INVALID_USER_TOKEN));
        }

        //check for token and id in the database for online users. and get roleid.
        let authrepo = new AuthRepository();
        //check user is online or not.
        authrepo.getOnlinestatus(userDecoded.id, location)
            .then(function (result: def.UserOnlineStatus) {
                try {
                    let newToken: string = token;
                    let newExpiry: Date = new Date(userDecoded.exp);
                    if (result == def.UserOnlineStatus.ONLINE) {
                        let auth: model.AuthModel = authrepo.refreshAccessToken(userDecoded.id);
                        newToken = auth.token;
                        newExpiry = auth.expires;
                    }
                    res.setHeader("CLAPI-User-Access-Token", newToken);
                    res.setHeader("CLAPI-User-Access-Token-Expiry", newExpiry.toJSON());
                }
                catch (err) {
                    return next(err);
                }

                //get user's roles
                authrepo.getUserRoles(userDecoded.id)
                    .then(function (result: Array<number>) {
                        checkRoleAccess(result, req, next);
                    })
                    .catch(function (err) {
                        return next(err);
                    });                
            })
            .catch(function (err) {
                return next(err);
            });
    }
}

function checkRoleAccess(roleIds: Array<number>, req: express.Request, next: Function) {
    let hasAccess: boolean = false;
    let auth: AuthRepository = new AuthRepository();
    let reqURL: string = req.url.toLowerCase();
    let action: def.Action;
    switch (req.method) {
        case 'GET':
            action = def.Action.Read;
            break;
        case 'PUT':
            action = def.Action.Modify;
            break;
        case 'POST':
            action = def.Action.Add;
            break;
        case 'DELETE':
            action = def.Action.Delete;
            break;
    }
    auth.getRoleAccessList()
        .then(function (result: Array<model.RoleAccess>) {
            for (let roleId of roleIds) {
                let aa: Array<model.RoleAccess> = new Array<model.RoleAccess>();
                aa = result.filter(function (el) {
                    return el.idRole == roleId && reqURL.includes(el.resource.toLocaleLowerCase()) && (el.actionMask & action) == action;
                });
                if (aa.length > 0) {
                    hasAccess = true;
                    break;
                }
            }
         
            if (hasAccess) {
                return next();
            }
            else {
                return next(new CLError.Forbidden(CLError.ErrorCode.USER_NOT_AUTHORIZED));
            }
        })
        .catch(function (err) {
            return next(err);
        });
}