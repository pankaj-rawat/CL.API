import express = require("express");
import {TagModel} from "../models/CategoryTagModel";
import {TagRepository} from "../repositories/CategoryTagRepository";
import {APIResponse} from "../APIResponse";
import {Util} from "../Util";
import config = require('config');
import {RepoResponse} from "../RepoResponse";

let tagController = express.Router();
tagController.get('/:id', function (req: express.Request, res: express.Response, next) {
    let id: number = req.params.id;
    let tagRepo: TagRepository = new TagRepository();
    tagRepo.get(id)
    .then(function (result: TagModel) {
        let apiResponse: APIResponse = {
            data: result,
            isValid: true
        }
        res.send(apiResponse);
    })
    .catch(function (err) {
        next(err);
    });    
});

tagController.get('/', function (req: express.Request, res: express.Response, next) {
    let tagRepo: TagRepository = new TagRepository();    
    let clRes: APIResponse;
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);
    let active: boolean = Boolean(req.query.active) || true;
    let idCategory: number = req.query.idcategory;
    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    if (offset < 0) {
        offset = 0;
    }

    tagRepo.getAll(offset, limit,idCategory, active)
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

tagController.post('', function (req: express.Request, res: express.Response, next) {

    let tagRepo: TagRepository = new TagRepository();

    let tag: TagModel = {
        value: req.body.value,
        idCategory: req.body.idCategory,
        active: true
    }

    tagRepo.create(tag)
        .then(function (result: TagModel) {
            let apiResponse: APIResponse = {
                data: result,
                isValid: true
            }
            let util: Util = new Util();
            res.setHeader('clapi-resource-location',util.getPostedResourceLocation(req,result.id.toString()));
            res.status(201).send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = tagController;