import {CountryRepository} from "../repositories/CityStateCountryRepository";
import {APIResponse} from "../APIResponse";
import express = require("express");
import config = require('config');
import {Util} from "../Util";

var countryController = express.Router();

countryController.get('/:id', function (req:express.Request, res:express.Response,next ) {
    let cscrepo = new CountryRepository();
    let clRes: APIResponse; 
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

countryController.get('', function (req, res,next) {
    let cscrepo = new CountryRepository();
    let clRes: APIResponse;
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);
    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    cscrepo.getAll(offset,limit)
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

module.exports = countryController;