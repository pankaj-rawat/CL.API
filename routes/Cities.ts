import {CityRepository} from  "../repositories/CityStateCountryRepository";
import APIResponse = require('../APIResponse');
import {RepoResponse} from "../RepoResponse";
import express = require('express');
import config = require('config');
import {Util} from "../Util";

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
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);
    let idState: number = Number(req.query.idState || 0);

    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    if (offset < 0) {
        offset = 0;
    }
    let repoResponse: Promise<RepoResponse>;
    if (idState) {
        repoResponse = cscrepo.getAll(offset, limit, idState);
    }
    else {
        repoResponse = cscrepo.getAll(offset, limit);
    }
    repoResponse.then(function (result) {
        let util: Util = new Util();
        clRes = { data: result.data, isValid: true };
        var pageLink = util.getPageLinks(util.getURLstring(req), offset, limit, result.recordCount);
        res.links(pageLink);
        res.setHeader('Content-Range', util.getHeaderContentRange(offset, limit, result.recordCount));
        res.send(clRes);
    });
    repoResponse.catch(function (err) {
        next(err);
    });

});

module.exports = cityController;