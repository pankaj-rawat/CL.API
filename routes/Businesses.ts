import express = require('express');
import {APIResponse} from "../APIResponse";
import {Logger} from "../Logger";
import *  as model from "../models/BusinessModel";
import * as CategoryTagModel from "../models/CategoryTagModel";
import {BusinessRepository} from "../repositories/BusinessRepository";
import config = require('config');
import {Util} from "../Util";
import {RepoResponse} from "../RepoResponse";

let businessController = express.Router();

businessController.post('/', function (req: express.Request, res: express.Response, next: Function) {
    let contactNumbers: Array<model.BusinessPhoneModel> = new Array<model.BusinessPhoneModel>();
    let businessImages: Array<model.BusinessImageModel> = new Array<model.BusinessImageModel>();
    let businessOperationHours: Array<model.BusinessOperationHourModel> = new Array<model.BusinessOperationHourModel>();
    let tags: Array<CategoryTagModel.TagModel> = new Array<CategoryTagModel.TagModel>();
    let createdBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key)
    if (createdBy == null) {
        //request by guest
        createdBy = 0;
    }
    Logger.log.info("business registration requested from " + req.hostname);
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    let business: model.BusinessModel;
    try {
        business = {
            idCity: req.body.idCity
            , commenceDate: req.body.commenceDate
            , contactName: req.body.contactName
            , contactTitle: req.body.contactTitle
            , idStatus: req.body.idStatus
            , description: req.body.description
            , idCountry: req.body.idCountry
            , idState: req.body.idState
            , idUser: req.body.idUser
            , latitude: req.body.latitude
            , longitude: req.body.longitude
            , name: req.body.name
            , postalCode: req.body.postalCode
            , idRegistrationPlan: req.body.idRegistrationPlan
            , streetAddress: req.body.streetAddress
            , webURL: req.body.webURL
            , contactNumbers: getContactNumberList(JSON.parse(req.body.contactNumbers))
            , images: getImageList(JSON.parse(req.body.images))
            , operationHours: getOperationHourList(JSON.parse(req.body.operationHours))
            , tags: getTagList(req.body.tags)
            , createdBy: createdBy
            , idCategory: req.body.idCategory
        }

        if (business != null) {
            businessRepo.register(business)
                .then(function (result) {
                    apiResponse = {
                        data: result,
                        isValid: true
                    };
                    let util: Util = new Util();
                    res.setHeader('location', util.getPostedResourceLocation(req, result.id.toString()));
                    res.status(201).send(apiResponse);
                })
                .catch(function (err) {
                    next(err);
                });
        }
    }
    catch (err) {
        next(err);
    }
});

businessController.get('/', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let clRes: APIResponse;

    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);
    let idCity: number = Number(req.query.idcity || req.body.idCity || 0);
    let searchText: string = req.query.searchText || req.body.searchText || '';
    let latitude: number = req.query.lat || req.body.lat;
    let longitude: number = req.query.long || req.body.long;

    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    if (offset < 0) {
        offset = 0;
    }

    let repoResponse: Promise<RepoResponse>;

    if (idCity != 0) {
        repoResponse = businessRepo.searchByCity(offset, limit, searchText, idCity);
    }
    else {
        repoResponse = businessRepo.searchByLatLong(offset, limit, searchText, latitude, longitude);           
    }
    repoResponse.then(function (result) {
        let util: Util = new Util();
        clRes = { data: result.data, isValid: true };
        var pageLink = util.getPageLinks(util.getURLstring(req), offset, limit, result.recordCount);
        res.links(pageLink);
        res.setHeader('Content-Range', util.getHeaderContentRange(offset, limit, result.recordCount));
        res.send(clRes);
    })
        repoResponse.catch(function (err) {
            next(err);
        })
});

businessController.get('/:id', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    businessRepo.find(req.params.id)
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

function getContactNumberList(phones: Array<model.BusinessPhoneModel>): Array<model.BusinessPhoneModel> {
    let contactNumbers: Array<model.BusinessPhoneModel> = new Array<model.BusinessPhoneModel>();
    //Do any massage if required  else removes these methods call in future.
    contactNumbers = phones;
    return contactNumbers;
}

function getImageList(images: Array<model.BusinessImageModel>): Array<model.BusinessImageModel> {
    //Do any massage if required  else removes these methods call in future.
    return images;
}

function getOperationHourList(operationHours: Array<model.BusinessOperationHourModel>): Array<model.BusinessOperationHourModel> {
    //Do any massage if required  else removes these methods call in future.
    return operationHours;
}

function getTagList(tagstring: string): Array<CategoryTagModel.TagModel> {
    let tags: Array<CategoryTagModel.TagModel> = new Array<CategoryTagModel.TagModel>();
    let tempTags: Array<string> = tagstring.split(',');
    for (let val of tempTags) {
        //let tag: CategoryTagModel.TagModel = {
        //    id: Number(val)
        tags.push({
            id: Number(val)
        });
        //}       
    }

    return tags;
}
module.exports = businessController;