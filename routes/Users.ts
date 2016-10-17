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
    Logger.log.info('login in process: ' + req);
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    let username = req.body.username;
    let password = req.body.password;
    let response: Promise<amodel.AuthModel> = authrepo.login(username, password);
    response.then(function (result: amodel.AuthModel) {
        clRes = { data: result, isValid: true };
        res.send(clRes);
    });
    response.catch(function (error) {
        next(error);
    });
});

userController.get('/:id', function (req:express.Request, res:express.Response) {
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
    let hashedP:string = bcrypt.hashSync(req.body.password, salt);

    user = {
        email: req.body.email,
        idCity: req.body.idCity,
        password: hashedP,
        phoneLandLine: req.body.phoneLandline,
        extension:req.body.extension,
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