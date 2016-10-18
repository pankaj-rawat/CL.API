import irepo = require("../interfaces/IBusinessRepository");
import model = require("../models/BusinessModel");
import * as CategoryTagModel from "../models/CategoryTagModel";
import * as DB from "../DB";
import {Logger as logger} from "../Logger";
import {ErrorCode} from '../ErrorCode';
import * as CLError from '../CLError';

export class BusinessRepository implements irepo.IBusinessRepository {
    register(business: model.BusinessModel): Promise<model.BusinessModel> {
        return new Promise(function (resolve, reject) {
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
                }
                else {
                    let encounteredError: boolean = false;
                    let businessId: number;
                    let images: string = getImagesString(business.images);
                    let phones: string = getPhonesString(business.contactNumbers);
                    let tags: string = getTagsString(business.tags);
                    let operationhours: string = getOperationHourString(business.operationHours);
                    let query = connection.query('Call sp_business_insert(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                        , [business.name, business.contactName, business.contactTitle, business.idStatus, business.streetAddress,
                            business.postalCode, business.idCity, business.idState, business.idCountry, business.webURL, business.latitude,
                            business.longitude, business.description, business.commenceDate, images, phones, tags, operationhours,
                            business.idRegistrationPlan, business.idUser]);
                    query.on('error', function (err) {
                        encounteredError = true;
                        return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR,"Error occured while saving business."));
                    });
                    query.on('result', function (row, index) {
                        if (index == 0) {
                            businessId = row.id;
                        }
                    });
                    query.on('end', function () {
                        connection.release();
                        if (!encounteredError) {
                            getBusiness(businessId)
                                .then(function (result) {
                                    resolve(result);
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
                        }
                    });
                }
            });
        });
    };
    unRegister(id: number): Promise<number> {
        return new Promise(function (resolve, reject) {
        });
    };

    find(id: number): Promise<model.BusinessModel> {
        return new Promise(function (resolve, reject) {
            getBusiness(id)
                .then(function (result) {
                    resolve(result);
                })
                .catch(function (err) {
                   reject(err);
                });
        });
    };
    update(business: model.BusinessModel): Promise<model.BusinessModel> {
        return new Promise(function (resolve, reject) {
        });
    };

    addOffer(offer: model.BusinessOfferModel): Promise<model.BusinessOfferModel> {
        return new Promise(function (resolve, reject) {
        });
    };
    updateOffer(offer: model.BusinessOfferModel): Promise<model.BusinessOfferModel> {
        return new Promise(function (resolve, reject) {
        });
    };
    deactivateOffer(id: number): Promise<boolean> {
        return new Promise(function (resolve, reject) {
        });
    };
}

function getBusiness(id: number): Promise<model.BusinessModel> {
    return new Promise(function (resolve, reject) {
        let business: model.BusinessModel;
        DB.get().getConnection(function (err, connection) {
            if (err) {
                return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
            }
            else {
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_business_select(?)', id);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while reading business. ' + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
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
                            createdOn: row.createdOn,
                            lastUpdateOn: row.lastUpdatedOn,
                            description: row.description,
                            commenceDate: row.commenceDate,
                            idUser: row.idUser,
                            city: row.city,
                            state: row.state,
                            country: row.country,
                            idRegistrationPlan: row.idRegistrationPlan,
                            registrationPlanExpiry: row.registrationPlanExpiry,
                            registrationPlanOptDate: row.registrationPlanOptDate,
                            registrationPlanName: row.rpName
                        };
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (business) {
                            resolve(business);
                        }
                        else {
                            return reject(new CLError.NotFound(ErrorCode.RESOURCE_NOT_FOUND,"Business for Id " + id + " not found"));
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
                if (result == null) {
                    result = image.isProfileImage + ";" + image.imgURL;
                }
                else {
                    result = result + "," + image.isProfileImage + ";" + image.imgURL;
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