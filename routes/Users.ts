import {UserRepository} from  "../repositories/UserRepository";
import {AuthRepository} from  "../repositories/AuthRepository";
import {APIResponse} from "../APIResponse";
import model = require('../models/UserModel');
import * as amodel from "../models/AuthModel";
import bcrypt = require('bcryptjs');
import express = require('express');
import {Logger}  from "../Logger";

var userController = express.Router();

userController.post('/login', function (req, res, next) {
    Logger.log.info('login is in process.');
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    let username = req.body.username;
    let password = req.body.password;
    let userLocation = req.headers['x-location'] || (req.query && req.query.location);
    authrepo.authenticateUser(username, password)
        .then(function (auth:amodel.AuthModel) {
            let userRepo = new UserRepository();
            userRepo.login(username, userLocation)
                .then(function (user: model.UserModel) {
                    clRes = { data: user, isValid: true };
                    res.setHeader('Access-Token', auth.token);
                    res.setHeader('Access-Token-Expiry', auth.expires.toJSON());
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

userController.post('/logout', function (req, res, next) {
    let clRes: APIResponse;    
    let userId = Number.parseInt(req.headers['x-key'] || (req.query && req.query.key));
    let userLocation = req.headers['x-location'] || (req.query && req.query.location);
    let userRepo = new UserRepository();
    userRepo.logout(userId, userLocation)
        .then(function (isSuccess:boolean) {
            clRes = { data: isSuccess, isValid: true };
            res.send(clRes);
            Logger.log.info('logout process complete.');
        })
        .catch(function (err) {
            next(err);
        });
});

userController.get('/:id', function (req: express.Request, res: express.Response) {
    let userP: Promise<model.UserModel>;
    let userRepo = new UserRepository();
    let clres: APIResponse;
    userP = userRepo.find(req.params.id);
    userP.then(function (user: model.UserModel) {
        clres = {
            data: user,
            isValid: true
        };
        res.send(clres);
    });

    userP.catch(function (err) {
        clres = {
            isValid: false,
            message: err.message
        };
        res.send(clres);
    });
});

userController.post('/signup', function (req, res) {
    let usrepo = new UserRepository();
    let userP: Promise<model.UserModel>;
    let user: model.UserModel;
    let clres: APIResponse;

    let salt = bcrypt.genSaltSync(10);
    let hashedP: string = bcrypt.hashSync(req.body.password, salt);

    user = {
        email: req.body.email,
        idCity: req.body.idCity,
        password: hashedP,
        phoneLandLine: req.body.phoneLandline,
        extension: req.body.extension,
        phoneCell: req.body.phoneCell,
        subscriptionOptIn: req.body.subscriptionOptIn
    }
    userP = usrepo.create(user);
    userP.then(function (user: model.UserModel) {
        user.password = undefined;// clear pwd before sending back the result
        clres = {
            data: user,
            isValid: true
        };
        res.send(clres);
    });
    userP.catch(function (err) {
        clres = {
            isValid: false,
            message: err.message
        };
        res.send(clres);
    });
});

userController.post('/reset', function (req, res) {
    let user = req.body.userName;

});

module.exports = userController;