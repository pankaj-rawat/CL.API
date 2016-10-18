import {APIResponse} from "../APIResponse";
import {StateRepository} from  "../repositories/CityStateCountryRepository";
import express = require('express');
import url = require('url');
import config = require('config');

var stateController = express.Router();

stateController.get('/:id', function (req: express.Request, res: express.Response, next): void {
    let clRes: APIResponse;
    let stateRepo = new StateRepository();
    let id = req.params.id;
    stateRepo.find(id)
        .then(function (result) {
            clRes = { data: result, isValid: true };
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

stateController.get('', function (req: express.Request, res: express.Response, next): void {
    let stateRepo = new StateRepository();
    let clRes: APIResponse;
    var query = url.parse(req.url, true).query;
    let offset: number = query.offset || 0;
    let limit: number = query.limit || process.env.PAGING_LIMIT || config.get("paging.limit");

    stateRepo.getAll(offset, limit)
        .then(function (result) {
            clRes = { data: result, isValid: true };
            res.header('X-Pagination-Count','10' );
            res.header('X-Pagination-Page', offset.toString() );
            res.header('X-Pagination-Limit', limit.toString());
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = stateController;