import express = require('express');
import {APIResponse} from "../APIResponse";
import {Logger} from "../Logger";
import *  as model from "../models/BusinessModel";
import * as CategoryTagModel from "../models/CategoryTagModel";
import {BusinessRepository} from "../repositories/BusinessRepository";

let businessController = express.Router();

businessController.post('', function (req: express.Request, res: express.Response) {
    let contactNumbers: Array<model.BusinessPhoneModel> = new Array<model.BusinessPhoneModel>();
    let businessImages: Array<model.BusinessImageModel> = new Array<model.BusinessImageModel>();
    let businessOperationHours: Array<model.BusinessOperationHourModel> = new Array<model.BusinessOperationHourModel>();
    let tags: Array<CategoryTagModel.TagModel> = new Array<CategoryTagModel.TagModel>();

    Logger.log.info("business registration requested from " + req.hostname);
    let businessRepo: BusinessRepository = new BusinessRepository();
    let apiResponse: APIResponse;
    try {
        if (req.body.contactNumbers == null || req.body.images == null || req.body.operationHours == null || req.body.tags == null) {
            apiResponse = {              
                isValid: false,
                error: {
                    message: "Input data missing.",
                    number: 1
                }
            };
            res.send(apiResponse);
            return;
        }
        let business: model.BusinessModel = {
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
            ,images: getImageList(JSON.parse(req.body.images))
            ,operationHours: getOperationHourList(JSON.parse(req.body.operationHours))
            ,tags: getTagList(req.body.tags)
        }
              
        businessRepo.register(business)
            .then(function (result) {
                apiResponse = {
                    data: result,
                    isValid: true
                };
                res.send(apiResponse);
            })
            .catch(function (err) {
                apiResponse = {
                    isValid: false,
                    error: { message: err.message, number: err.number }
                };
                res.send(apiResponse);
            });
    }
    catch (err) {
        apiResponse = {
            isValid: false,
            error: { message: err.message, number: err.number }
        };
        res.send(apiResponse);
    }

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