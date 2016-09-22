import ld = require('lodash');
import jwt = require('jwt-simple');
import {AuthRepository} from "../repositories/AuthRepository";
import config = require('config');
import *  as model from "../models/AuthModel";
import {Role} from "../Definitions";

export class RequestValidator {

    Validate(req, res, next) {
        // When performing a cross domain request, you will recieve
        // a preflighted request first. This is to check if the app
        // is safe. 
        // We skip the token outh for [OPTIONS] requests.
        //if(req.method == 'OPTIONS') next();

        const httpStatus_BADREQUEST = 400;
        const httpStatus_FORBIDDEN = 403;
        const httpStatus_UNAUTHORIZED = 401;
        const httpStatus_INTERNALSERVERERROR = 500;
        const unsecuredRoutes: string[] = ['api/login', 'api/search', 'api/user/signup'];//public route

        let token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
        let key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

        if ((req.url.indexOf('api/login') >= 0)
            || (req.url.indexOf('api/search') >= 0)
            || (req.url.indexOf('api/users/signup') >= 0)) {
            next();
        }
        else if (token || key) {
            try {
                let decoded = jwt.decode(token, String(config.get("token.key")));
                if (decoded.exp <= Date.now()) {
                    res.status(httpStatus_BADREQUEST);
                    res.json({
                        "status": httpStatus_BADREQUEST,
                        "message": "Token Expired"
                    });
                    return;
                }
                let authRepo = new AuthRepository();
                // The key would be the logged in user's username
                authRepo.validateUser(key, function (userRoles) {
                    if (userRoles) {
                        if (ld.includes(userRoles, Role.Admin)) {
                            next(); // To move to next middleware
                        }
                        else {
                            res.status(httpStatus_FORBIDDEN);
                            res.json({
                                "status": httpStatus_FORBIDDEN,
                                "message": "Not Authorized"
                            });
                            return;
                        }
                    } else {
                        // No user with this name exists, respond back with a 401
                        res.status(httpStatus_UNAUTHORIZED);
                        res.json({
                            "status": httpStatus_UNAUTHORIZED,
                            "message": "Invalid User"
                        });
                        return;
                    }

                });

            } catch (err) {
                res.status(httpStatus_INTERNALSERVERERROR);
                res.json({
                    "status": httpStatus_INTERNALSERVERERROR,
                    "message": "Oops something went wrong",
                    "error": err
                });
            }
        } else {
            res.status(httpStatus_UNAUTHORIZED);
            res.json({
                "status": httpStatus_UNAUTHORIZED,
                "message": "Invalid Token or Key"
            });
            return;
        }
    };
}