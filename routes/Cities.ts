import {CityRepository} from  "../repositories/CityStateCountryRepository";
import APIResponse = require('../APIResponse');
import {RepoResponse} from "../RepoResponse";
import express = require('express');
import config = require('config');
import * as Util from "../Util";

var cityController = express.Router();

cityController.get('/:id', function (req: express.Request, res: express.Response, next) {
    let clRes: APIResponse.APIResponse;
    let cscrepo = new CityRepository();
    let id = req.params.id;
    cscrepo.find(id)
        .then(function (result) {
            clRes = { data: result, isValid: true };
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});



cityController.get('/', function (req: express.Request, res: express.Response, next) {
    let clRes: APIResponse.APIResponse;
    let cscrepo = new CityRepository();
    let util: Util.Util = new Util.Util();
    let pagingInfo: Util.PagingInfo = util.getPagingInfo(req);     
    let idState: number = Number(req.query.idstate || 0);
    
    let repoResponse: Promise<RepoResponse>;
    if (idState) {
        repoResponse = cscrepo.getAll(pagingInfo.offset, pagingInfo.limit, idState);
    }
    else {
        repoResponse = cscrepo.getAll(pagingInfo.offset, pagingInfo.limit);
    }
    repoResponse.then(function (result) {      
        clRes = { data: result.data, isValid: true };        
        res = util.setResponseHeaderPageLinks(result.recordCount, req, res, pagingInfo);  
        res.send(clRes);
    });
    repoResponse.catch(function (err) {
        next(err);
    });

});

module.exports = cityController;