import {CityRepository} from  "../repositories/CityStateCountryRepository";
import {APIResponse} from "../APIResponse";
import {Util} from "../Util";
import express = require('express');
import config = require('config');

var cityController = express.Router();

cityController.get('/:id', function (req:express.Request, res:express.Response,next) {
    let clRes: APIResponse;   
    let cscrepo = new CityRepository();   
    let id = req.params.id;
    cscrepo.find(id)
        .then(function (result) {
            clRes = { data: result.data, isValid: true };
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

cityController.get('', function (req:express.Request, res:express.Response,next):void {
    let clRes: APIResponse;   
    let cscrepo = new CityRepository();
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);
    let idState: number = Number(req.query.idstate || 0);

    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }

    cscrepo.getAll(offset,limit,idState)
        .then(function (result) {
            let util: Util = new Util();
            clRes = { data: result.data, isValid: true };
            var pageLink = util.getPageLinks(util.getURLstring(req), offset, limit, result.recordCount);
            res.links(pageLink);
            res.setHeader('Content-Range', util.getHeaderContentRange(offset, limit, result.recordCount));
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
   
});

module.exports = cityController;