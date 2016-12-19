import express = require('express');
import {APIResponse} from "../APIResponse";
import {Logger} from "../Logger";
import *  as model from "../models/BusinessModel";
import * as CategoryTagModel from "../models/CategoryTagModel";
import {BusinessRepository} from "../repositories/BusinessRepository";
import config = require('config');
import {Util} from "../Util";
import {RepoResponse} from "../RepoResponse";
import {CLConstants} from "../CLConstants";
import * as def from "../Definitions";

let businessController = express.Router();

businessController.post('/', function (req: express.Request, res: express.Response, next: Function) {
    Logger.log.info("business registration requested from " + req.hostname);
    save(req, res, next);
});

businessController.post('/:id/mybusiness', function (req: express.Request, res: express.Response, next: Function) {
    Logger.log.info("business claim requested from " + req.hostname);    
    let idUser = req.headers['clapi-user-key'] || (req.query && req.query.user_key);
    let location = req.headers['clapi-user-location'];
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    businessRepo.myBusinessRequest(req.params.id, idUser, location)
        .then(function (result) {
            apiResponse = {
                data: result
                , isValid: true
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        });
});

businessController.put('/:id/mybusiness', function (req: express.Request, res: express.Response, next: Function) {
    Logger.log.info("business claim requested from " + req.hostname);
    let idUser = req.headers['clapi-user-key'] || (req.query && req.query.user_key);
    let location = req.headers['clapi-user-location'];
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    businessRepo.assignUser(req.params.id, idUser,req.body.code, location)
        .then(function (result) {
            apiResponse = {
                data: result
                , isValid: true
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        });
});

businessController.put('/:id', function (req: express.Request, res: express.Response, next: Function) {
    Logger.log.info("business update requested from " + req.hostname);
    save(req, res, next);
});

businessController.get('/', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let clRes: APIResponse;

    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);
    let idCity: number = Number(req.query.idcity || 0);
    let search: string = req.query.search || '';
    let latitude: number = req.query.lat;
    let longitude: number = req.query.long;

    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }
    if (offset < 0) {
        offset = 0;
    }

    let repoResponse: Promise<RepoResponse>;

    if (idCity != 0) {
        repoResponse = businessRepo.searchByCity(offset, limit, search, idCity);
    }
    else {
        repoResponse = businessRepo.searchByLatLong(offset, limit, search, latitude, longitude);
    }
    repoResponse.then(function (result) {
        let util: Util = new Util();
        clRes = { data: result.data, isValid: true };
        var pageLink = util.getPageLinks(util.getURLstring(req), offset, limit, result.recordCount);
        res.links(pageLink);
        res.setHeader('content-range', util.getHeaderContentRange(offset, limit, result.recordCount));
        res.send(clRes);
    })
    repoResponse.catch(function (err) {
        next(err);
    })
});

businessController.get('/:id', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    businessRepo.get(req.params.id)
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

businessController.post('/:idBusiness/offers', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    let offer: model.BusinessOfferModel;
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    offer = {
        offer: req.body.offer
        , detail: req.body.detail
        , effectiveDate: req.body.effectiveDate
        , expireDate: req.body.expireDate
        , idBusiness: req.params.idBusiness
        , termsCondition: req.body.termsCondition
    };
    businessRepo.saveOffer(offer, requestBy)
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

businessController.put('/:idBusiness/offers/:id', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    let offer: model.BusinessOfferModel;
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    offer = {
        id:req.params.id
        ,offer: req.body.offer
        , detail: req.body.detail
        , effectiveDate: req.body.effectiveDate
        , expireDate: req.body.expireDate
        , idBusiness: req.params.idBusiness
        , termsCondition: req.body.termsCondition
    };
    businessRepo.saveOffer(offer, requestBy)
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

businessController.delete('/:idBusiness/offers/:id', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    let offer: model.BusinessOfferModel;
    let requestBy: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key) || CLConstants.GUEST_USER;
    offer = {
        id: req.params.id
        , idBusiness: req.params.idBusiness
        , idStatus:def.Status.InActive
        , offer: undefined
        , detail: undefined
        , effectiveDate: undefined
        , expireDate: undefined        
        , termsCondition: undefined        
    };
    businessRepo.saveOffer(offer, requestBy)
        .then(function (result) {
            apiResponse = {
                data: result
                , isValid: true
            };
            res.send(apiResponse);
        })
        .catch(function (err) {
            next(err);
        });
});

businessController.get('/:idBusiness/offers', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;    
    let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
    let offset: number = Number(req.query.offset || 0);
    let limit: number = Number(req.query.limit || 0);

    if (limit <= 0 || limit > maxLimit) {
        limit = maxLimit;
    }

    businessRepo.getAllOffer(offset,limit,req.params.idBusiness)
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

businessController.get('/:idBusiness/offers/:id', function (req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    businessRepo.getOffer(req.params.id, req.params.idBusiness)
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
        tags.push({
            id: Number(val)
        });
    }
    return tags;
}

function save(req: express.Request, res: express.Response, next: Function) {
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    let business: model.BusinessModel;
    let idUser: number = req.headers['clapi-user-key'] || (req.query && req.query.user_key);
    let requestBy: number = idUser || CLConstants.GUEST_USER;
    let id: number = req.params.id;

    try {
        business = {
            id: id
            , idCity: req.body.idCity
            , commenceDate: req.body.commenceDate
            , contactName: req.body.contactName
            , contactTitle: req.body.contactTitle
            , idStatus: req.body.idStatus
            , description: req.body.description
            , idCountry: req.body.idCountry
            , idState: req.body.idState
            , idUser: idUser
            , latitude: req.body.latitude
            , longitude: req.body.longitude
            , name: req.body.name
            , postalCode: req.body.postalCode
            , idRegistrationPlan: req.body.idRegistrationPlan
            , streetAddress: req.body.streetAddress
            , webURL: req.body.webURL
            , email:req.body.email
            , contactNumbers: getContactNumberList(JSON.parse(req.body.contactNumbers))
            , images: getImageList(JSON.parse(req.body.images))
            , operationHours: getOperationHourList(JSON.parse(req.body.operationHours))
            , tags: getTagList(req.body.tags)
            , idCategory: req.body.idCategory
        };
        if (business != null) {
            businessRepo.save(business, requestBy)
                .then(function (result) {
                    apiResponse = {
                        data: result,
                        isValid: true
                    };
                    let util: Util = new Util();
                    res.setHeader('clapi-resource-location', util.getPostedResourceLocation(req, result.id.toString()));
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
}

module.exports = businessController;