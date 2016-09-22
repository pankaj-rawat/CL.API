import express = require('express');
import {APIResponse} from "../APIResponse";
import {AuthRepository} from "../repositories/AuthRepository";
import * as model from "../models/AuthModel";
import {Logger}  from "../Logger";

var authController = express.Router();
authController.post('/login', function (req, res) {
    Logger.log.info('login requested: ' + req);
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    try {        
        let username= req.body.username;
        let password = req.body.password;
        let response: Promise<model.AuthModel> = authrepo.login(username, password);
        response.then(function (result:model.AuthModel) {
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

module.exports = authController;