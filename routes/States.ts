import {APIResponse} from "../APIResponse";
import * as Util from "../Util";
import {StateRepository} from  "../repositories/CityStateCountryRepository";
import express = require('express');
import config = require('config');

var stateController = express.Router();

stateController.get('/:id', function (req: express.Request, res: express.Response, next): void {
    let clRes: APIResponse;
    let stateRepo = new StateRepository();
    let id = req.params.id;
    stateRepo.find(id)
        .then(function (result) {
            clRes = { data: result.data, isValid: true };
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

stateController.get('', function (req: express.Request, res: express.Response, next): void {
    let stateRepo = new StateRepository();
    let clRes: APIResponse;
    let util: Util.Util = new Util.Util();
    let pagingInfo: Util.PagingInfo = util.getPagingInfo(req); 
    let idCountry: number = Number(req.query.idcountry || 0); 
        
    stateRepo.getAll(pagingInfo.offset, pagingInfo.limit, idCountry)
        .then(function (result) {          
            clRes = { data: result.data, isValid: true };
            res = util.setResponseHeaderPageLinks(result.recordCount, req, res, pagingInfo);  
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = stateController;