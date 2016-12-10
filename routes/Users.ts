import {UserRepository} from  "../repositories/UserRepository";
import {AuthRepository} from  "../repositories/AuthRepository";
import {APIResponse} from "../APIResponse";
import model = require('../models/UserModel');
import {RepoResponse} from "../RepoResponse";
import * as amodel from "../models/AuthModel";
import express = require('express');
import {Logger}  from "../Logger";
import config = require('config');
import {Util} from "../Util";
import {CLConstants} from "../CLConstants";

var userController = express.Router();

userController.get('/:id', function (req: express.Request, res: express.Response, next: Function) {
    let userP: Promise<model.UserModel>;
    let userRepo = new UserRepository();
    let clres: APIResponse;
    let requestedBy: number = Number(req.headers['clapi-user-key']) || CLConstants.GUEST_USER;
    userP = userRepo.get(req.params.id,requestedBy);
    userP.then(function (user: model.UserModel) {
        clres = {
            data: user,
            isValid: true
        };
        res.send(clres);
    });

    userP.catch(function (err) {
        next(err);
    });
});

userController.get('/', function (req: express.Request, res: express.Response, next: Function) {
    let userRepo = new UserRepository();
    let clRes: APIResponse;


    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);
    let requestedBy: number = Number(req.headers['clapi-user-key']) || CLConstants.GUEST_USER;
    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    if (offset < 0) {
        offset = 0;
    }

    userRepo.getAll(offset, limit, requestedBy)
        .then(function (result) {
            let util: Util = new Util();
            clRes = { data: result.data, isValid: true };
            var pageLink = util.getPageLinks(util.getURLstring(req), offset, limit, result.recordCount);
            res.links(pageLink);
            res.setHeader('content-range', util.getHeaderContentRange(offset, limit, result.recordCount));
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

userController.post('/', function (req: express.Request, res: express.Response, next: Function) {
    let usrepo = new UserRepository();
    let userP: Promise<model.UserModel>;
    let user: model.UserModel;
    let clres: APIResponse;
    user = {
        email: req.body.email,
        idCity: req.body.idCity,
        password: req.body.password,
        phoneLandLine: req.body.phoneLandline,
        extension: req.body.extension,
        phoneCell: req.body.phoneCell,
        subscriptionOptIn: req.body.subscriptionOptIn
    }
    userP = usrepo.save(user);
    userP.then(function (user: model.UserModel) {
        user.password = undefined;// clear pwd before sending back the result
        clres = {
            data: user,
            isValid: true
        };
        let util: Util = new Util();
        if (user.id != null) {
            res.setHeader('clapi-resource-location', util.getPostedResourceLocation(req, user.id.toString()));
        }
        res.status(201).send(clres);
    });
    userP.catch(function (err) {
        next(err);
    });
});

userController.put('/:id', function (req: express.Request, res: express.Response, next: Function) {
    let usrepo = new UserRepository();
    let userP: Promise<model.UserModel>;
    let user: model.UserModel;
    let clres: APIResponse;
    let requestedBy: number = Number(req.headers['clapi-user-key']) || CLConstants.GUEST_USER;
    user = {
        id:req.params.id,
        email: req.body.email,
        idCity: req.body.idCity,        
        phoneLandLine: req.body.phoneLandline,
        extension: req.body.extension,
        phoneCell: req.body.phoneCell,
        subscriptionOptIn: req.body.subscriptionOptIn
    }
    userP = usrepo.save(user, requestedBy);
    userP.then(function (user: model.UserModel) {
        user.password = undefined;// clear pwd before sending back the result
        clres = {
            data: user,
            isValid: true
        };
        let util: Util = new Util();
        if (user.id != null) {
            res.setHeader('clapi-resource-location', util.getPostedResourceLocation(req, user.id.toString()));
        }
        res.status(200).send(clres);
    });
    userP.catch(function (err) {
        next(err);
    });
});


userController.post('/login', function (req: express.Request, res: express.Response, next: Function) {
    Logger.log.info('login is in process.');
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    let email = req.body.email;
    let password = req.body.password;
    let userLocation = req.headers['clapi-user-location'] || req.query.user_location;
    authrepo.authenticateUser(email, password)
        .then(function (auth: amodel.AuthModel) {
            let userRepo = new UserRepository();
            userRepo.login(email, userLocation)
                .then(function (user: model.UserModel) {
                    clRes = { data: user, isValid: true };
                    res.setHeader('clapi-user-access-token', auth.token);
                    res.setHeader('clapi-user-access-token-expiry', auth.expires.toJSON());
                    res.send(clRes);
                    Logger.log.info('login process complete.');
                })
                .catch(function (err) {
                    next(err);
                });
        })
        .catch(function (error) {
            next(error);
        });
});

userController.post('/logout', function (req: express.Request, res: express.Response, next: Function) {
    let clRes: APIResponse;
    let userId = Number.parseInt(req.headers['clapi-user-key'] || (req.query && req.query.user_key));
    let userLocation = req.headers['clapi-user-location'] || (req.query && req.query.user_location);
    let userRepo = new UserRepository();
    userRepo.logout(userId, userLocation)
        .then(function (isSuccess: boolean) {
            clRes = { data: isSuccess, isValid: true };
            res.send(clRes);
            Logger.log.info('logout process complete.');
        })
        .catch(function (err) {
            next(err);
        });
});

userController.post('/forget-password', function (req: express.Request, res: express.Response, next: Function) {
    let email = req.body.email;
    let location = req.headers['clapi-user-location'] || req.query.user_location;
    let resetURL = req.body.resetURL;
    let usrepo = new UserRepository();
    let clres: APIResponse;
    usrepo.forgetPassword(email, location, resetURL)
        .then(function (result: boolean) {
            clres = {
                data: result,
                isValid: true
            };
            res.send(clres);
        })
        .catch(function (err) {
            next(err);
        });
});

userController.put('/:id/password/reset', function (req: express.Request, res: express.Response, next: Function) {
    let idUser = req.params.id;
    let location = req.headers['clapi-user-location'] || req.query.user_location;
    let newPwd: string = req.body.newPassword;
    let userepo = new UserRepository();
        
    //fpToken is the token sent by api to client as a response of forget password request.
    let fpToken: string = req.body.fpToken; 

    userepo.updatePassword(idUser, location, newPwd, null, fpToken)
        .then(function (result: boolean) {
            let clres: APIResponse;
            clres = {
                data: result,
                isValid: true
            };
            res.send(clres);
        })
        .catch(function (err) {
            next(err);
        });
});

userController.put('/:id/password/change', function (req: express.Request, res: express.Response, next: Function) {
    let idUser = req.params.id;
    let location = req.headers['clapi-user-location'] || req.query.user_location;
    let newPwd: string = req.body.newPassword;
    let userepo = new UserRepository();

    //should get this value when logged-in user try to update his\her password
    let requestedBy: number = Number(req.headers['clapi-user-key']);    

    userepo.updatePassword(idUser, location, newPwd, requestedBy)
        .then(function (result: boolean) {
            let clres: APIResponse;
            clres = {
                data: result,
                isValid: true
            };
            res.send(clres);
        })
        .catch(function (err) {
            next(err);
        });
});


module.exports = userController;