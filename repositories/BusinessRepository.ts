import irepo = require("../interfaces/IBusinessRepository");
import {RepoResponse } from "../RepoResponse";
import model = require("../models/BusinessModel");
import * as CategoryTagModel from "../models/CategoryTagModel";
import * as DB from "../DB";
import {Logger as logger} from "../Logger";
import * as CLError from '../CLError';
import config = require('config');
import {CLMailer} from "../CLMailer";

export class BusinessRepository implements irepo.IBusinessRepository {
    save(business: model.BusinessModel, requestedBy: number): Promise<model.BusinessModel> {
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
                    let query = connection.query('Call sp_upsert_business(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                        , [business.id, business.name, business.contactName, business.contactTitle, business.streetAddress,
                            business.postalCode, business.idCity, business.idState, business.idCountry, business.webURL, business.email, business.latitude,
                            business.longitude, business.description, business.commenceDate, imageString, phoneString, tagString, operationhoursString,
                            business.idRegistrationPlan, business.idUser, requestedBy, business.idCategory]);
                    query.on('error', function (err) {
                        encounteredError = true;
                        let clError: CLError.DBError;
                        clError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while saving business. " + "(" + err.errno + ")" + err.message);
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
                                    email: row.email,
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
                                    , expireDate: row.expireDate
                                    , effectiveDate: row.effectiveDate
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
                                return reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "error occured while reading recently saved business for Id " + business.id + "."));
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
                                    email: row.email,
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
                                    idCategory: row.idCategory,
                                    rating: row.rating
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
                                    , expireDate: row.expireDate
                                    , effectiveDate: row.effectiveDate
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
                                return reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "Business for Id " + id + " not found."));
                            }
                        }
                    });
                }
            });
        });
    };

    searchByLatLong(offset: number, limit: number, searchText: string, latitude: Number, longitude: Number): Promise<RepoResponse> {
        return searchBusiness(offset, limit, searchText, latitude, longitude, 0);
    };
    searchByCity(offset: number, limit: number, searchText: string, idCity: number): Promise<RepoResponse> {
        return searchBusiness(offset, limit, searchText, 0, 0, idCity);
    };

    myBusinessRequest(idBusiness: number, idUser: number, location: string): Promise<number> {
        return new Promise<number>(function (resolve, reject) {
            if (location == null || location == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "location missing."));
            }
            if (idUser == null || idUser <= 0) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "user Id missing."));
            }
            let dateObj = new Date();
            let daysToCodeExpiry: number = process.env.MYBUSINESS_REQUEST_CODE_DAYS_TO_EXP || config.get("mybusiness_request_code_days_to_exp");
            let codeExpiryDate = new Date(new Date().getTime() + (daysToCodeExpiry * 24 * 60 * 60 * 1000));
            let verificationCode: number;
            let email: string;
            let resultCode: number;
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
                }
                let encounteredError: boolean = false;
                let query = connection.query('CAll sp_insert_business_claim_request(?,?);', [idUser, idBusiness]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while searching businesses." + err.message));
                });

                query.on('result', function (row, index: number) {
                    if (index == 0) {
                        verificationCode = row.code;
                        email = row.email;
                        resultCode = row.resultCode;
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (verificationCode != null) {
                            let clmailer: CLMailer = new CLMailer();
                            let msg: string = "Your code to claim business is .<br><br><b>" + verificationCode + "</b>";
                            clmailer.sendMail(email, 'Claim your business listing.', null, msg)
                                .then(function (result: string) {
                                    resolve(resultCode);
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
                        }
                        else {
                            return reject(new CLError.CustomError("Verification mail failed", 200, CLError.ErrorCode.MAILER_FAILED, "Verification mail failed"));
                        }
                    }
                });
            });
        });
    }
    assignUser(idBusiness: number, idUser: number, code: string, location: string): Promise<number> {
        return new Promise<number>(function (resolve, reject) {
            if (location == null || location == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "location missing."));
            }
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
                }

                let resultCode: number;
                let encounteredError: boolean = false;
                let query = connection.query('CAll sp_update_business_assign_user(?,?,?);', [code, idUser, idBusiness]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error assigning user to business." + err.message));
                });

                query.on('result', function (row, index: number) {
                    if (index == 0) {
                        resultCode = row.resultCode;
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (resultCode != null && resultCode == 1) {
                            resolve(resultCode);
                        }
                        else {
                            return reject(new CLError.CustomError("Business user assignment error", 200, 300, " (" + resultCode + ")" + "Business user assignmnet failed."));
                        }
                    }
                });
            });
        });
    }

    saveOffer(offer: model.BusinessOfferModel, requestedBy: number): Promise<model.BusinessOfferModel> {
        return new Promise<model.BusinessOfferModel>(function (resolve, reject) {
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_upsert_business_offer(?,?,?,?,?,?,?,?,?)',
                    [offer.id, offer.offer, offer.effectiveDate, offer.expireDate, offer.idStatus, offer.idBusiness
                        , offer.termsCondition, offer.detail, requestedBy]);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while saving offer. ' + err.message);
                    clError.stack = err.stack;
                    return reject(clError);
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        offer.id = row.id;
                        offer.createDate = row.createDate;
                        offer.updateDate = row.updateDate;
                        offer.idStatus = row.idStatus;
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (offer.id != null) {
                            resolve(offer);
                        }
                        else {
                            return reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "Business for Id " + offer.id + " not found."));
                        }
                    }
                });
            });
        });
    };
    getOffer(id: number, idBusness: number): Promise<model.BusinessOfferModel> {
        return new Promise<model.BusinessOfferModel>(function (resolve, reject) {

            getOffer(0, 1, id, idBusness)
                .then(function (result) {
                    resolve(result.data[0]);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    };
    getAllOffer(offset: number, limit: number, idBusiness?: number): Promise<RepoResponse> {
        return getOffer(offset, limit, null, idBusiness);
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
                            , profileImageURL: row.imageURL
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

function getOffer(offset: number, limit: number, id?: number, idBusiness?: number): Promise<RepoResponse> {
    return new Promise<RepoResponse>(function (resolve, reject) {
        let offers: Array<model.BusinessOfferModel> = new Array<model.BusinessOfferModel>();
        DB.get().getConnection(function (err, connection) {
            if (err) {
                return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
            }

            let encounteredError: boolean = false;
            let recCount: number = 0;
            let query = connection.query('SET @rCount=0; CAll sp_select_business_offer(@rCount,?,?,?,?); select @rCount rcount;',
                [offset, limit, id, idBusiness]);
            query.on('error', function (err) {
                encounteredError = true;
                return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while reading offers." + err.message));
            });
            query.on('result', function (row, index) {
                if (index == 1) {
                    offers.push({
                        id: row.id
                        , offer: row.offer
                        , detail: row.detail
                        , effectiveDate: row.effectiveDate
                        , expireDate: row.expireDate
                        , createDate: row.createDate
                        , updateDate: row.updateDate
                        , idStatus: row.idStatus
                        , idBusiness: row.idBusiness
                        , termsCondition: row.termsCondition
                    });
                }
                else if (index == 3) {
                    recCount = row.rcount;
                }
            });
            query.on('end', function () {
                connection.release();
                if (!encounteredError) {
                    if (offers.length > 0) {
                        let res: RepoResponse = {
                            data: offers
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
};