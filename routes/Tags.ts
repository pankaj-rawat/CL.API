import express = require("express");
import {TagModel} from "../models/CategoryTagModel";
import {TagRepository} from "../repositories/CategoryTagRepository";
import {APIResponse} from "../APIResponse";

let tagController = express.Router();
tagController.get('/:id', function (req: express.Request, res: express.Response) {
    let id: number = req.params.id;
    let tagRepo: TagRepository = new TagRepository();
    let tagP: Promise<TagModel> = tagRepo.find(id);
    tagP.then(function (result: TagModel) {
        let apiResponse: APIResponse = {
            data: result,
            isValid: true
        }
        res.send(apiResponse);
    });
    tagP.catch(function (err) {
        let apiResponse: APIResponse = {
            isValid: false,
            message: err.message
        }
        res.send(apiResponse);
    });
});

tagController.get('/category/:id', function (req: express.Request, res: express.Response) {
    let tagRepo: TagRepository = new TagRepository();
    let idCategory: number=req.params.id;
    let tagP: Promise<Array<TagModel>> = tagRepo.getTagsByCategory(idCategory);
    tagP.then(function (result: Array<TagModel>) {
        let apiResponse: APIResponse = {
            data: result,
            isValid: true
        }
        res.send(apiResponse);
    });
    tagP.catch(function (err) {
        let apiResponse: APIResponse = {
            isValid: false,
            message: err.message
        }
        res.send(apiResponse);
    });
});

tagController.post('/', function (req: express.Request, res: express.Response) {

    let tagRepo: TagRepository = new TagRepository();
    
    let tag: TagModel= {
        value: req.body.value,
        idCategory: req.body.idCategory,
        active: true
    }
    let tagP: Promise<TagModel> = tagRepo.create(tag);

    tagP.then(function (result:TagModel) {
        let apiResponse: APIResponse = {
            data: result,
            isValid: true
        }
        res.send(apiResponse);
    });
    tagP.catch(function (err) {
        let apiResponse: APIResponse = {
            isValid: false,
            message: err.message
        }
        res.send(apiResponse);
    });
});

module.exports = tagController;