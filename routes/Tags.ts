import express = require("express");
import {TagModel} from "../models/CategoryTagModel";
import {TagRepository} from "../repositories/CategoryTagRepository";
import {APIResponse} from "../APIResponse";
import * as Util from "../Util";
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
    let util: Util.Util = new Util.Util();
    let pagingInfo: Util.PagingInfo = util.getPagingInfo(req); 
    let active: boolean = Boolean(req.query.active) || true;
    let idCategory: number = req.query.idcategory;
   

    tagRepo.getAll(pagingInfo.offset, pagingInfo.limit,idCategory, active)
        .then(function (result) {           
            clRes = { data: result.data, isValid: true };
            res = util.setResponseHeaderPageLinks(result.recordCount, req, res, pagingInfo);  
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
            let util: Util.Util = new Util.Util();
            res.setHeader('clapi-resource-location',util.getPostedResourceLocation(req,result.id.toString()));
            res.status(201).send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = tagController;