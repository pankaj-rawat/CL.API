import {APIResponse} from "../APIResponse";
import {StateRepository} from  "../repositories/CityStateCountryRepository";
import express = require('express');

var stateController = express.Router();

stateController.get('/:id', function (req:express.Request, res:express.Response):void {
    let clRes: APIResponse;   
    let stateRepo = new StateRepository();
    let id = req.params.id;
    try {
        stateRepo.find(id)
            .then(function (result) {
                clRes = { data: result, isValid: true };
                res.send(clRes);
            })
            .catch(function (err) {
                clRes = { message: err.meassage, isValid: false };
                res.send(clRes);
            });
    }
    catch (Error) {
        clRes = { message: Error.meassage, isValid: false };
        res.send(clRes);
    }    
});

stateController.get('/country/:id', function (req, res):void {
    let stateRepo = new StateRepository();
    let clRes: APIResponse;   
    let id = req.params.id;
    try {
        stateRepo.getStatesByCountry(id)
            .then(function (result) {
                clRes = { data: result, isValid: true };
                res.send(clRes);
            })
            .catch(function (err) {
                clRes = { message: err.message, isValid: false };
                res.send(clRes);
            });
    }
    catch (Error) {
        clRes = { message: Error.message, isValid: false };
        res.send(clRes);
    }    
});

module.exports = stateController;