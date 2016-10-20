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
    var query = url.parse(req.url, true).query;
    let offset: number = query.offset || 0;
    let limit: number = query.limit || process.env.PAGING_LIMIT || config.get("paging.limit");
    let idCountry: number = query.idCountry;
    stateRepo.getAll(offset, limit, idCountry)
        .then(function (result) {
            clRes = { data: result.data, isValid: true };
            //let pages: Page = CreateLink(offset,
            res.setHeader('Content-Range', offset.toString() + "-" + ((offset-0)+ (limit-1)).toString() + "/" + result.recordCount ); //subtracting with 0 just to convert into number again.
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

function CreateLink(currentPage, limit, totalCount): Page {
    let a: Page = new Page();
    var totalPossiblePage = Math.floor(totalCount / limit);
    var totalPage = totalPossiblePage < (totalCount / limit) ? totalPossiblePage + 1 : totalPossiblePage;
    a.current = currentPage;
    a.first = 0;
    a.last = totalPage - 1;

    if (currentPage < (totalPage-1))
    {
        a.next = currentPage + 1;
    }
    if (currentPage > 0) {
        a.Prev = currentPage - 1;
    }
    return a;
};

class Page {
    next: number;
    last: number;
    first: number;
    Prev: number;
    current: number;
};

module.exports = stateController;