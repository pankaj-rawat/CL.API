import express = require('express');
import {APIResponse} from "../APIResponse";
import *  as model from "../models/ReviewModel";
import {ReviewRepository} from "../repositories/ReviewRepository";
import config = require('config');
import {Util} from "../Util";
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

reviewController.put('/:id', function (req: express.Request, res: express.Response, next: Function) {
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

reviewController.put('/:id/updatestatus', function (req: express.Request, res: express.Response, next: Function) {
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

reviewController.delete('/:id', function (req: express.Request, res: express.Response, next: Function) {
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

reviewController.get('/:id', function (req: express.Request, res: express.Response, next: Function) {
    let reviewRepo: ReviewRepository = new ReviewRepository();
    let apiResponse: APIResponse;
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    reviewRepo.get(req.params.id, requestBy)
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

reviewController.get('/', function (req: express.Request, res: express.Response, next: Function) {
    let reviewRepo: ReviewRepository = new ReviewRepository();
    let apiResponse: APIResponse;

    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);

    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    reviewRepo.getAll(offset, limit, requestBy, req.query.iduser, req.query.idbusiness,req.query.idstatus)
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
module.exports = reviewController;