import express = require('express');
import {APIResponse} from "../APIResponse";
import {AuthRepository} from "../repositories/AuthRepository";
import * as model from "../models/AuthModel";
import {Logger}  from "../Logger";

let authController = express.Router();

authController.post('/login', function (req, res,next) {
    Logger.log.info('login in process: ' + req);
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    let username = req.body.username;
    let password = req.body.password;
    let response: Promise<model.AuthModel> = authrepo.login(username, password);
    response.then(function (result: model.AuthModel) {
        clRes = { data: result, isValid: true };
        res.send(clRes);
    });
    response.catch(function (error) {
        next(error);
    });
});

authController.post('/connect', function (req, res,next) {
    Logger.log.info('connection in process: ' + req);
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    let idNotAvailable: number = 0;
    let clientName = req.body.clientName;
    let clientKey = req.body.clientKey;
    let response: Promise<model.AuthModel> = authrepo.connect(idNotAvailable, clientName, clientKey);
    response.then(function (result: model.AuthModel) {
        clRes = { data: result, isValid: true };
        res.send(clRes);
    });
    response.catch(function (err) {
        next(err);
    });
});

module.exports = authController;