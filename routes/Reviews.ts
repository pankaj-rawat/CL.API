import express = require('express');
import {APIResponse} from "../APIResponse";
import *  as model from "../models/ReviewModel";
import {ReviewRepository} from "../repositories/ReviewRepository";
import config = require('config');
import * as Util from "../Util";
import {CLConstants} from "../CLConstants";
import * as def from "../Definitions";

let reviewController = express.Router();

reviewController.post('/', function (req: express.Request, res: express.Response, next: Function) {
    let reviewRepo: ReviewRepository = new ReviewRepository();
    let apiResponse: APIResponse;
    let review: model.ReviewModel;
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    review = {
        idBusiness: req.body.idBusiness
        , rating: req.body.rating
        , comment: req.body.comment
        , idReviewParent: req.body.idParent
    };
    reviewRepo.save(review, requestBy)
        .then(function (result) {
            let msg: string;
            if (result == null) {
                msg = "No data Saved.";
            }
            apiResponse = {
                data: result
                , isValid: true
                , message: msg
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        })
});

reviewController.put('/:id([0-9]+)', function (req: express.Request, res: express.Response, next: Function) {
    let reviewRepo: ReviewRepository = new ReviewRepository();
    let apiResponse: APIResponse;
    let review: model.ReviewModel;
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    review = {
        id: req.params.id
        , idBusiness: req.body.idBusiness
        , rating: req.body.rating
        , comment: req.body.comment
    };
    reviewRepo.save(review, requestBy)
        .then(function (result) {
            let msg: string;
            if (result == null) {
                msg = "No data Saved.";
            }
            apiResponse = {
                data: result
                , isValid: true
                , message: msg
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        })
});

reviewController.put('/:id([0-9]+)/updatestatus', function (req: express.Request, res: express.Response, next: Function) {
    let reviewRepo: ReviewRepository = new ReviewRepository();
    let apiResponse: APIResponse;
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    reviewRepo.updateStatus(req.params.id, req.body.idStatus, requestBy)
        .then(function (result) {
            apiResponse = {
                data: result
                , isValid: true
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        })
});

reviewController.delete('/:id([0-9]+)', function (req: express.Request, res: express.Response, next: Function) {
    let reviewRepo: ReviewRepository = new ReviewRepository();
    let apiResponse: APIResponse;
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    reviewRepo.updateStatus(req.params.id, def.Status.InActive, requestBy)
        .then(function (result) {
            apiResponse = {
                data: result
                , isValid: true
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        })
});

reviewController.get('/:id([0-9]+)?', function (req: express.Request, res: express.Response, next: Function) {
    let reviewRepo: ReviewRepository = new ReviewRepository();
    let apiResponse: APIResponse;    
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    let id: number = req.params.id || req.query.id;
    if (id != null) {
        reviewRepo.get(id, requestBy)
            .then(function (result) {
                apiResponse = {
                    data: result
                    , isValid: true
                };
                res.send(apiResponse);
            })
            .catch(function (err) {
                next(err);
            })
    }
    else {
        let util: Util.Util = new Util.Util();
        let pagingInfo: Util.PagingInfo = util.getPagingInfo(req);
        reviewRepo.getAll(pagingInfo.offset, pagingInfo.limit, requestBy, req.query.iduser, req.query.idbusiness, req.query.idstatus,req.query.idreviewparent)
            .then(function (result) {
                apiResponse = {
                    data: result
                    , isValid: true
                };
                res = util.setResponseHeaderPageLinks(result.recordCount, req, res, pagingInfo);
                res.send(apiResponse);
            })
            .catch(function (err) {
                next(err);
            })
    }
});

module.exports = reviewController;