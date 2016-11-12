import express = require("express");
import {TagModel} from "../models/CategoryTagModel";
import {TagRepository} from "../repositories/CategoryTagRepository";
import {APIResponse} from "../APIResponse";
import {Util} from "../Util";

let tagController = express.Router();
tagController.get('/:id', function (req: express.Request, res: express.Response, next) {
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
        next(err);
    });
});

tagController.get('/category/:id', function (req: express.Request, res: express.Response, next) {
    let tagRepo: TagRepository = new TagRepository();
    let idCategory: number = req.params.id;
    tagRepo.getTagsByCategory(idCategory)
    .then(function (result: Array<TagModel>) {
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
            res.setHeader('location',util.getPostedResourceLocation(req,result.id.toString()));
            res.status(201).send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = tagController;