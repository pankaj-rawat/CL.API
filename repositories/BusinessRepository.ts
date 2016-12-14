﻿import irepo = require("../interfaces/IBusinessRepository");
import {RepoResponse } from "../RepoResponse";
import model = require("../models/BusinessModel");
import * as CategoryTagModel from "../models/CategoryTagModel";
import * as DB from "../DB";
import {Logger as logger} from "../Logger";
import * as CLError from '../CLError';

export class BusinessRepository implements irepo.IBusinessRepository {
    save(business: model.BusinessModel): Promise<model.BusinessModel> {
        return new Promise<model.BusinessModel>(function (resolve, reject) {
            let images: Array<model.BusinessImageModel> = new Array<model.BusinessImageModel>();
            let phones: Array<model.BusinessPhoneModel> = new Array<model.BusinessPhoneModel>();
            let operationHours: Array<model.BusinessOperationHourModel> = new Array<model.BusinessOperationHourModel>();
            let offers: Array<model.BusinessOfferModel> = new Array<model.BusinessOfferModel>();

            if (business.contactNumbers == null || business.images == null || business.operationHours == null || business.tags == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "Input data missing."));
            }
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                else {
                    let encounteredError: boolean = false;
                    let businessId: number;
                    let imageString: string = getImagesString(business.images);
                    let phoneString: string = getPhonesString(business.contactNumbers);
                    let tagString: string = getTagsString(business.tags);
                    let operationhoursString: string = getOperationHourString(business.operationHours);
                    let query = connection.query('Call sp_upsert_business(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                        , [business.id, business.name, business.contactName, business.contactTitle, business.streetAddress,
                            business.postalCode, business.idCity, business.idState, business.idCountry, business.webURL, business.latitude,
                            business.longitude, business.description, business.commenceDate, imageString, phoneString, tagString, operationhoursString,
                            business.idRegistrationPlan, business.idUser, business.createdBy, business.idCategory]);
                    query.on('error', function (err) {
                        encounteredError = true;
                        let clError: CLError.DBError;
                        clError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while saving business. " + err.message);
                        clError.stack = err.stack;
                        return reject(clError);
                    });
                    query.on('result', function (row, index) {
                        switch (index) {
                            case 0: //business
                                business = {
                                    id: row.id,
                                    name: row.name,
                                    contactName: row.contactName,
                                    contactTitle: row.contactTitle,
                                    idStatus: row.idStatus,
                                    streetAddress: row.streetAddress,
                                    postalCode: row.postalCode,
                                    idCity: row.idCity,
                                    idState: row.idState,
                                    idCountry: row.idCountry,
                                    webURL: row.webURL,
                                    latitude: row.latitude,
                                    longitude: row.longitude,
                                    geo: row.geo,
                                    description: row.description,
                                    commenceDate: row.commenceDate,
                                    idUser: row.idUser,
                                    city: row.city,
                                    state: row.state,
                                    country: row.country,
                                    idRegistrationPlan: row.idRegistrationPlan,
                                    registrationPlanExpireDate: row.registrationPlanExpireDate,
                                    registrationPlanOptDate: row.registrationPlanOptDate,
                                    registrationPlanName: row.rpName,
                                    createdBy: row.createdBy,
                                    createDate: row.createDate,
                                    updatedBy: row.updatedBy,
                                    updateDate: row.updateDate,
                                    idCategory: row.idCategory
                                };
                                break;
                            case 1://opeartionhours
                                let operationHour: model.BusinessOperationHourModel = {
                                    day: row.day
                                    , idBusiness: row.idBusiness
                                    , timeOpen: row.timeOpen
                                    , timeClose: row.timeClose
                                }
                                operationHours.push(operationHour);
                                break;
                            case 2: //phones
                                phones.push({
                                    idBusiness: row.idBusiness
                                    , phone: row.phone
                                    , extension: row.extension
                                    , type: row.type
                                });
                                break;
                            case 3: //images
                                images.push({
                                    id: row.id
                                    , idBusinessId: row.idBusiness
                                    , imageURL: row.imageURL
                                    , isProfileImage: row.isProfileIamge
                                    , uploadDate: row.uploadDate
                                });
                                break;
                            case 4: //offers
                                offers.push({
                                    id: row.id
                                    , offer: row.id
                                    , detail: row.detail
                                    , createDate: row.createDate
                                    , expiryDate: row.expiryDate
                                    , updateDate: row.updateDate
                                    , idBusiness: row.idBusiness
                                    , idStatus: row.idStatus
                                    , termsCondition: row.termsCondition
                                });
                                break;
                        }
                    });
                    query.on('end', function () {
                        connection.release();
                        if (!encounteredError) {
                            if (business) {
                                business.images = images;
                                business.operationHours = operationHours;
                                business.contactNumbers = phones;
                                business.offers = offers;
                                resolve(business);
                            }
                            else {
                                return reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "error occured while reading recently saved business for Id " + business.id +"."));
                            }
                        }
                    });
                }
            });
        });
    };
    unRegister(id: number): Promise<number> {
        return new Promise<number>(function (resolve, reject) {
        });
    };
    get(id: number): Promise<model.BusinessModel> {
        return new Promise<model.BusinessModel>(function (resolve, reject) {
            getBusiness(id)
                .then(function (result) {
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    };
    searchByLatLong(offset: number, limit: number, searchText: string, latitude: Number, longitude: Number): Promise<RepoResponse> {
        return searchBusiness(offset, limit, searchText, latitude, longitude, 0);
    };
    searchByCity(offset: number, limit: number, searchText: string, idCity: number): Promise<RepoResponse> {
        return searchBusiness(offset, limit, searchText, 0, 0, idCity);
    };
    update(business: model.BusinessModel): Promise<model.BusinessModel> {
        return new Promise<model.BusinessModel>(function (resolve, reject) {
        });
    };
    addOffer(offer: model.BusinessOfferModel): Promise<model.BusinessOfferModel> {
        return new Promise<model.BusinessOfferModel>(function (resolve, reject) {
        });
    };
    updateOffer(offer: model.BusinessOfferModel): Promise<model.BusinessOfferModel> {
        return new Promise<model.BusinessOfferModel>(function (resolve, reject) {
        });
    };
    deactivateOffer(id: number): Promise<boolean> {
        return new Promise<boolean>(function (resolve, reject) {
        });
    };
}

function searchBusiness(offset: number, limit: number, searchText: string, latitude: Number, longitude: Number, idCity: number): Promise<RepoResponse> {
    return new Promise<RepoResponse>(function (resolve, reject) {
        if (offset < 0) {
            return reject(new CLError.BadRequest(CLError.ErrorCode.INVALID_PARAM_VALUE, "Invalid value supplied for offset\limit params."));
        }
        DB.get().getConnection(function (err, connection) {
            if (err) {
                return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
            }
            let businesses: Array<model.BusinessSearchResultModel> = new Array<model.BusinessSearchResultModel>();
            let encounteredError: boolean = false;
            let recCount: number = 0;
            let query = connection.query('SET @rCount=0; CAll sp_search_business(@rCount,?,?,?,?,?,?); select @rCount rcount;', [offset, limit, idCity, latitude, longitude, searchText]);
            query.on('error', function (err) {
                encounteredError = true;
                return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while searching businesses." + err.message));
            });
            query.on('result', function (row, index) {
                if (index == 1) {
                    let business: model.BusinessSearchResultModel =
                        {
                            id: row.id
                            , name: row.name
                            , streetAddress: row.streetAddress
                            , idCity: row.idCity
                            , city: row.city
                            , idState: row.idState
                            , state: row.state
                            , postalCode: row.postalCode
                            , webURL: row.webURL
                            , latitude: row.latitude
                            , longitude: row.longitude
                            , geo: row.geo
                            , idStatus: row.idStatus
                            , status: row.status
                            , profileImgURL: row.imgURL
                            , idOffer: row.idOffer
                            , offer: row.offer
                            , rating: row.rating
                            , idCategory: row.idCategory
                            , category: row.category
                            , idUser: row.idUser
                        };
                    businesses.push(business);
                }
                if (index == 3) {
                    recCount = row.rcount;
                }
            });
            query.on('end', function () {
                connection.release();
                if (!encounteredError) {
                    if (businesses.length > 0) {
                        let res: RepoResponse = {
                            data: businesses
                            , recordCount: recCount
                        };
                        resolve(res);
                    }
                    else {
                        reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "No record found."));
                    }
                }
            });
        });
    });
}

function getBusiness(id: number): Promise<model.BusinessModel> {
    return new Promise<model.BusinessModel>(function (resolve, reject) {
        let business: model.BusinessModel;
        let images: Array<model.BusinessImageModel> = new Array<model.BusinessImageModel>();
        let phones: Array<model.BusinessPhoneModel> = new Array<model.BusinessPhoneModel>();
        let operationHours: Array<model.BusinessOperationHourModel> = new Array<model.BusinessOperationHourModel>();
        let offers: Array<model.BusinessOfferModel> = new Array<model.BusinessOfferModel>();

        DB.get().getConnection(function (err, connection) {
            if (err) {
                let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                clError.stack = err.stack;
                return reject(clError);
            }
            else {
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_select_business(?)', id);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while reading business. ' + err.message);
                    clError.stack = err.stack;
                    return reject(clError);
                });
                query.on('result', function (row, index) {
                    switch (index) {
                        case 0: //business
                            business = {
                                id: row.id,
                                name: row.name,
                                contactName: row.contactName,
                                contactTitle: row.contactTitle,
                                idStatus: row.idStatus,
                                streetAddress: row.streetAddress,
                                postalCode: row.postalCode,
                                idCity: row.idCity,
                                idState: row.idState,
                                idCountry: row.idCountry,
                                webURL: row.webURL,
                                latitude: row.latitude,
                                longitude: row.longitude,
                                geo: row.geo,
                                description: row.description,
                                commenceDate: row.commenceDate,
                                idUser: row.idUser,
                                city: row.city,
                                state: row.state,
                                country: row.country,
                                idRegistrationPlan: row.idRegistrationPlan,
                                registrationPlanExpireDate: row.registrationPlanExpireDate,
                                registrationPlanOptDate: row.registrationPlanOptDate,
                                registrationPlanName: row.rpName,
                                createdBy: row.createdBy,
                                createDate: row.createDate,
                                updatedBy: row.updatedBy,
                                updateDate: row.updateDate,
                                idCategory: row.idCategory
                            };
                            break;
                        case 1://opeartionhours
                            let operationHour: model.BusinessOperationHourModel = {
                                day: row.day
                                , idBusiness: row.idBusiness
                                , timeOpen: row.timeOpen
                                , timeClose: row.timeClose
                            }
                            operationHours.push(operationHour);                            
                            break;
                        case 2: //phones
                            phones.push({
                                idBusiness: row.idBusiness
                                , phone: row.phone
                                , extension: row.extension
                                , type: row.type
                            });
                            break;
                        case 3: //images
                            images.push({
                                id: row.id
                                , idBusinessId: row.idBusiness
                                , imageURL: row.imageURL
                                , isProfileImage: row.isProfileIamge
                                , uploadDate: row.uploadDate
                            });
                            break;
                        case 4: //offers
                            offers.push({
                                id: row.id
                                , offer: row.id
                                , detail: row.detail
                                , createDate: row.createDate
                                , expiryDate: row.expiryDate
                                , updateDate: row.updateDate
                                , idBusiness: row.idBusiness
                                , idStatus: row.idStatus
                                ,termsCondition:row.termsCondition
                            });
                            break;
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (business) {
                            business.images = images;
                            business.operationHours=operationHours;
                            business.contactNumbers=phones;
                            business.offers = offers;
                            resolve(business);
                        }
                        else {
                            return reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "Business for Id " + id + " not found."));
                        }
                    }
                });
            }
        });
    });
};

function getPhonesString(phones: Array<model.BusinessPhoneModel>): string {
    //expected string ->  phone;extension;type,phone1;extension1;type1
    let result: string = undefined;
    let ext: string = "";
    if (phones != null) {
        for (let phone of phones) {
            if (phone) {
                if (phone.extension) {
                    ext = phone.extension.toString();
                }
                if (result == null) {
                    result = phone.phone + ";" + ext + ";" + phone.type;
                }
                else {
                    result = result + "," + phone.phone + ";" + ext + ";" + phone.type;
                }

            }
        }
    }
    return result;
}

function getImagesString(images: Array<model.BusinessImageModel>): string {
    //expected string -> isProfilePic;imageURL,isProfilePic1;imageURL1
    let result: string = undefined;
    if (images != null) {
        for (let image of images) {
            if (image) {
                let imgString: string = image.id == null ? "0" : image.id + ";" + image.isProfileImage + ";" + image.imageURL;
                if (result == null) {
                    result = imgString;
                }
                else {
                    result = result + "," + imgString;
                }

            }
        }
    }
    return result;
}

function getOperationHourString(operationHours: Array<model.BusinessOperationHourModel>): string {
    //expected string -> day;timeopen;timeclose, day1;timeopen1;timeclose1
    let result: string = undefined;
    if (operationHours != null) {
        for (let operationHour of operationHours) {
            if (operationHour) {
                if (result == null) {
                    result = operationHour.day + ";" + operationHour.timeOpen + ";" + operationHour.timeClose;
                }
                else {
                    result = result + "," + operationHour.day + ";" + operationHour.timeOpen + ";" + operationHour.timeClose;
                }

            }
        }
    }
    return result;
}

function getTagsString(tags: Array<CategoryTagModel.TagModel>): string {
    //expected string -> tag,tag1,tag2
    let result: string = undefined;
    if (tags != null) {
        for (let tag of tags) {
            if (tag) {
                if (result == null) {
                    result = tag.id.toString();
                }
                else {
                    result = result + "," + tag.id.toString();
                }

            }
        }
    }
    return result;
}