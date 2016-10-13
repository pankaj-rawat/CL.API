import express = require('express');
import {Logger} from "../Logger";
import {RegistrationPlanRepository} from "../repositories/RegistrationPlanRepository";
import * as model from "../models/RegistrationPlanModel";
import {APIResponse} from "../APIResponse";

let registrationPlanController = express.Router();
registrationPlanController.get('', function (req: express.Request, res: express.Response) {
    let registrationPlanRepo: RegistrationPlanRepository = new RegistrationPlanRepository();
    let apiResponse: APIResponse;

    registrationPlanRepo.getAll()
        .then(function (results: Array<model.RegistrationPlanModel>) {
            apiResponse = {
                data: results,
                isValid: true
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            apiResponse = {
                isValid: false,
                error: {
                    message: err.message,
                    errorCode: 1// TODO:need to fix it.
                }
            };
            res.send(apiResponse);
        });
});

registrationPlanController.get('/:id', function (req: express.Request, res: express.Response) {
    let id: number = req.params.id;
    let registrationPlanRepo: RegistrationPlanRepository = new RegistrationPlanRepository();
    let apiResponse: APIResponse;
    registrationPlanRepo.find(id)
        .then(function (results: model.RegistrationPlanModel) {
            apiResponse = {
                data: results,
                isValid: true
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            apiResponse = {
                isValid: false,
                error: {
                    message: err.message,
                    errorCode: 1// TODO:need to fix it.
                }
            };
            res.send(apiResponse);
        });
});

module.exports = registrationPlanController;