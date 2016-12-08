import express = require("express");
import {CategoryModel} from "../models/CategoryTagModel";
import {CategoryRepository} from "../repositories/CategoryTagRepository";
import {APIResponse} from "../APIResponse";
import config = require('config');
import {RepoResponse} from "../RepoResponse";
import {Util} from "../Util";

let categoryController = express.Router();
categoryController.get('/:id', function (req: express.Request, res: express.Response,next:Function) {
    
    let id: number = req.params.id;
    let catRepo: CategoryRepository = new CategoryRepository();

    let categoryP: Promise<CategoryModel> = catRepo.get(id);
    categoryP.then(function (result:CategoryModel) {
        let apiResponse: APIResponse = {
            data: result,
            isValid:true
        }
        res.send(apiResponse);
    });
    categoryP.catch(function(err){
        next(err);
    });
});

categoryController.get('/', function (req: express.Request, res: express.Response, next: Function) {
    let catRepo: CategoryRepository = new CategoryRepository();
    let clRes: APIResponse;
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);   
    let active: boolean = Boolean(req.query.active) || true;
    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    if (offset < 0) {
        offset = 0;
    }

    catRepo.getAll(offset, limit, active)
    .then(function (result) {
        let util: Util = new Util();
        clRes = { data: result.data, isValid: true };
        var pageLink = util.getPageLinks(util.getURLstring(req), offset, limit, result.recordCount);
        res.links(pageLink);
        res.setHeader('content-range', util.getHeaderContentRange(offset, limit, result.recordCount));
        res.send(clRes);

    })
    .catch(function (err) {
       next(err)
    });
});

module.exports = categoryController;