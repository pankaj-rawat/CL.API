import express = require("express");
import {CategoryModel} from "../models/CategoryTagModel";
import {CategoryRepository} from "../repositories/CategoryTagRepository";
import {APIResponse} from "../APIResponse";
import config = require('config');
import {RepoResponse} from "../RepoResponse";
import * as Util from "../Util";

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
    let active: boolean = Boolean(req.query.active) || true;
    let util: Util.Util = new Util.Util();
    let pagingInfo: Util.PagingInfo = util.getPagingInfo(req); 
    
    catRepo.getAll(pagingInfo.offset, pagingInfo.limit, active)
    .then(function (result) {        
        clRes = { data: result.data, isValid: true };
        res = util.setResponseHeaderPageLinks(result.recordCount,req,res,pagingInfo);        
        res.send(clRes);

    })
    .catch(function (err) {
       next(err)
    });
});

module.exports = categoryController;