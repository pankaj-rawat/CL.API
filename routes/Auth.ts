import express = require('express');
import {APIResponse} from "../APIResponse";
import {AuthRepository} from "../repositories/AuthRepository";
import * as model from "../models/AuthModel";
import {Logger}  from "../Logger";

let authController = express.Router();

authController.post('/login', function (req, res) {
    Logger.log.info('login in process: ' + req);
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    try {
        let username = req.body.username;
        let password = req.body.password;
        let response: Promise<model.AuthModel> = authrepo.login(username, password);
        response.then(function (result: model.AuthModel) {
            clRes = { data: result, isValid: true };
            res.send(clRes);
        });
        response.catch(function (error) {
            clRes = { message: error.message, isValid: false }
            res.send(clRes);
        });
    }
    catch (Error) {
        clRes = { message: Error, isValid: false }
        res.send(clRes);
    }
});

authController.post('/connect', function (req, res) {
    Logger.log.info('connection in process: ' + req);
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    let idNotAvailable: number = 0;
    try {
        let clientName = req.body.clientName;
        let clientKey = req.body.clientKey;
        let response: Promise<model.AuthModel> = authrepo.connect(idNotAvailable,clientName, clientKey);
        response.then(function (result: model.AuthModel) {
            try {
                clRes = { data: result, isValid: true };
                res.send(clRes);
            }
            catch (error) {
                Logger.log.error(error.message);
                clRes = { message: "Connected but unable to send response.", isValid: false }
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
    }
    catch (Error) {
        clRes = { message: Error, isValid: false }
        res.send(clRes);
    }
});

module.exports = authController;