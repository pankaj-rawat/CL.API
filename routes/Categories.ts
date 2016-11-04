import express = require("express");
import {CategoryModel} from "../models/CategoryTagModel";
import {CategoryRepository} from "../repositories/CategoryTagRepository";
import {APIResponse} from "../APIResponse";

let categoryController = express.Router();
categoryController.get('/:id', function (req: express.Request, res: express.Response,next:Function) {
    
    let id: number = req.params.id;
    let catRepo: CategoryRepository = new CategoryRepository();

    let categoryP: Promise<CategoryModel> = catRepo.find(id);
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

categoryController.get('', function (req: express.Request, res: express.Response, next: Function) {
    let catRepo: CategoryRepository = new CategoryRepository();

    let categoryP: Promise<Array<CategoryModel>> = catRepo.getAll();
    categoryP.then(function (result: Array<CategoryModel>) {
        let apiResponse: APIResponse = {
            data: result,
            isValid: true
        }
        res.send(apiResponse);
    });
    categoryP.catch(function (err) {
       next(err)
    });
});

module.exports = categoryController;