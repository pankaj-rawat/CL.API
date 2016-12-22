import express = require('express');
import {Logger} from "../Logger";
import {RegistrationPlanRepository} from "../repositories/RegistrationPlanRepository";
import * as model from "../models/RegistrationPlanModel";
import {APIResponse} from "../APIResponse";
import config = require('config');
import {RepoResponse} from "../RepoResponse";
import * as Util from "../Util";

let registrationPlanController = express.Router();
registrationPlanController.get('/', function (req: express.Request, res: express.Response,next) {
    let registrationPlanRepo: RegistrationPlanRepository = new RegistrationPlanRepository();
    let apiResponse: APIResponse;
    let util: Util.Util = new Util.Util();
    let pagingInfo: Util.PagingInfo = util.getPagingInfo(req); 

    let active: boolean = Boolean(req.query.active) || true;
    

    registrationPlanRepo.getAll(pagingInfo.offset,pagingInfo.limit,active)
        .then(function (result) {            
            apiResponse = { data: result.data, isValid: true };
            res = util.setResponseHeaderPageLinks(result.recordCount, req, res, pagingInfo);  
            res.send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        });
});

registrationPlanController.get('/:id', function (req: express.Request, res: express.Response,next) {
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
            next(err);
        });
});

module.exports = registrationPlanController;