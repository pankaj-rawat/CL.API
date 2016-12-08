import express = require('express');
import {Logger} from "../Logger";
import {RegistrationPlanRepository} from "../repositories/RegistrationPlanRepository";
import * as model from "../models/RegistrationPlanModel";
import {APIResponse} from "../APIResponse";
import config = require('config');
import {RepoResponse} from "../RepoResponse";
import {Util} from "../Util";

let registrationPlanController = express.Router();
registrationPlanController.get('/', function (req: express.Request, res: express.Response,next) {
    let registrationPlanRepo: RegistrationPlanRepository = new RegistrationPlanRepository();
    let apiResponse: APIResponse;
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);
    let active: boolean = Boolean(req.query.active) || true;
    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    if (offset < 0) {
        offset = 0;
    }

    registrationPlanRepo.getAll(offset,limit,active)
        .then(function (result) {
            let util: Util = new Util();
            apiResponse = { data: result.data, isValid: true };
            var pageLink = util.getPageLinks(util.getURLstring(req), offset, limit, result.recordCount);
            res.links(pageLink);
            res.setHeader('content-range', util.getHeaderContentRange(offset, limit, result.recordCount));
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