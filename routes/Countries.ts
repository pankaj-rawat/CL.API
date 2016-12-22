import {CountryRepository} from "../repositories/CityStateCountryRepository";
import {APIResponse} from "../APIResponse";
import {RepoResponse} from "../RepoResponse";
import express = require("express");
import config = require('config');
import * as Util from "../Util";

var countryController = express.Router();

countryController.get('/:id', function (req:express.Request, res:express.Response,next ) {
    let cscrepo = new CountryRepository();
    let clRes: APIResponse; 
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

countryController.get('', function (req, res,next) {
    let cscrepo = new CountryRepository();
    let clRes: APIResponse;
    let util: Util.Util = new Util.Util();
    let pagingInfo: Util.PagingInfo = util.getPagingInfo(req); 
    cscrepo.getAll(pagingInfo.offset,pagingInfo.limit)
        .then(function (result: RepoResponse) {           
            clRes = { data: result.data, isValid: true };
            res = util.setResponseHeaderPageLinks(result.recordCount, req, res, pagingInfo);  
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = countryController;