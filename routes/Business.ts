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
    let business: model.BusinessModel = {
        idCity: req.body.idCity,
        commenceDate: req.body.commenceDate,
        contactName: req.body.contactName,
        contactTitle: req.body.contactTitle,
        description: req.body.description,
        idCountry: req.body.idCountry,
        idState: req.body.idState,
        idUser: req.body.idUser,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        name: req.body.name,
        postalCode: req.body.postalCode,
        registrationPlan: {
            idRegistrationPlan: req.body.idRegistrationPlan
        },
        streetAddress: req.body.streetAddress,
        webURL: req.body.webURL,
        contactNumbers: getContactNumberList(req),
        images: getImageList(req),
        operationHours: getOperationHourList(req),
        tags:getTagList(req)
    }
   
    let apiResponse: APIResponse;
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

});

function getContactNumberList(req: express.Request): Array<model.BusinessPhoneModel> {
    let contactNumbers: Array<model.BusinessPhoneModel> = new Array<model.BusinessPhoneModel>();
    contactNumbers.push({
        phone: 111,
        //extension: 1,
        type: "M"
    });

    contactNumbers.push({
        phone: 222,
        extension: 2,
        type: "M"
    });
    return contactNumbers;
}

function getImageList(req: express.Request): Array<model.BusinessImageModel> {
    let images: Array<model.BusinessImageModel> = new Array<model.BusinessImageModel>();
    images.push({
        isProfileImage: false,
        imgURL: "image1"
    });

    images.push({
        isProfileImage: false,
        imgURL: "image2"
    });
    return images;
}

function getOperationHourList(req: express.Request): Array<model.BusinessOperationHourModel> {
    let operationHours: Array<model.BusinessOperationHourModel> = new Array<model.BusinessOperationHourModel>();
    //populate list
    return operationHours;
}

function getTagList(req: express.Request): Array<CategoryTagModel.TagModel> {
    let tags: Array<CategoryTagModel.TagModel> = new Array<CategoryTagModel.TagModel>();
    //populate list
    return tags;
}
module.exports = businessController;