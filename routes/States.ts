import {APIResponse} from "../APIResponse";
import {StateRepository} from  "../repositories/CityStateCountryRepository";
import express = require('express');
import url = require('url');
import config = require('config');

var stateController = express.Router();

stateController.get('/:id', function (req:express.Request, res:express.Response,next):void {
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

stateController.get('', function (req: express.Request, res: express.Response,next):void {
    let stateRepo = new StateRepository();
    let clRes: APIResponse;   
    var query = url.parse(req.url, true).query;
    query.offset = query.offset || 0;
    query.limit = query.limit || process.env.PAGING_LIMIT || config.get("paging.limit");

    stateRepo.getAll()
        .then(function (result) {
            clRes = { data: result, isValid: true };
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = stateController;