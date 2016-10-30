import {APIResponse} from "../APIResponse";
import {Util} from "../Util";
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
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit")); 
    let offset: number = Number(req.query.offset || 0);  
    let limit: number = Number(req.query.limit || 0);
    let idCountry: number = Number(req.query.idCountry || 0);

    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
        
    stateRepo.getAll(offset, limit, idCountry)
        .then(function (result) {
            let util: Util = new Util();
            clRes = { data: result.data, isValid: true };
            var pageLink = util.getPageLinks(util.getURLstring(req), offset, limit, result.recordCount);
            res.links(pageLink);            
            res.setHeader('Content-Range', util.getHeaderContentRange(offset,limit,result.recordCount));
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = stateController;