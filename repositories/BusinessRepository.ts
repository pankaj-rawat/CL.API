import irepo = require("../interfaces/IBusinessRepository");
import model = require("../models/BusinessModel");
import * as CategoryTagModel from "../models/CategoryTagModel";
import * as DB from "../DB";
import {Logger as logger} from "../Logger";

export class BusinessRepository implements irepo.IBusinessRepository {
    register(business: model.BusinessModel): Promise<model.BusinessModel> {
        return new Promise(function (resolve, reject) {
            try {
                DB.get().getConnection(function (err, connection) {
                    if (err != null) {
                        logger.log.error(err.message);
                        reject(err);
                    }
                    else {
                        connection.beginTransaction(function (err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                let images: string=getImagesString(business.businessImages);
                                let phones: string=getPhonesString(business.contactNumbers);
                                let tags: string=getTagsString(business.categories);
                                let operationhours: string=getOperationHourString(business.businessOperationHours);
                                connection.query("Call sp_business_insert(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                                    , [business.name, business.contactName, business.contactTitle, business.idStatus, business.streetAddress,
                                        business.postalCode, business.idCity, business.idState, business.idCountry, business.webURL, business.latitude,
                                        business.longitude, business.description, business.commenceDate, images, phones, tags, operationhours,
                                        business.registrationPlan.idRegistrationPlan]
                                    , function (err, result) {
                                        if (err) {
                                            connection.rollback(function () {
                                                reject(err);
                                            });
                                        }
                                        else {
                                            let businessId: number = result.idBusiness;
                                            this.find(businessId)
                                                .then(function (result) {
                                                    resolve(result);
                                                })
                                                .catch(function (err) {
                                                    reject("some error occured while fetching recently saved bussiness.")
                                                });                                          
                                        }
                                    });
                            }
                        });
                    }
                });
            }
            catch (err) {
                logger.log.error(err);
                reject(err.message);
            }
        });
    };
    unRegister(id: number): Promise<number> {
        return new Promise(function (resolve, reject) {
        });
    };

    find(id: number): Promise<model.BusinessModel> {
        return new Promise(function (resolve, reject) {
            try {
                let business: model.BusinessModel;
                if (business) {
                    resolve(business);
                }
                else {
                    reject(new Error("no business found"));
                }
            }
            catch (err) {
                logger.log.error(err);
                reject(err.message);
            }
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

function getPhonesString(phones: Array<model.BusinessPhoneModel>): string {
    return 'ss';
}

function getImagesString(phones: Array<model.BusinessImageModel>): string {
    return 'ss';
}

function getOperationHourString(phones: Array<model.BusinessOperationHourModel>): string {
    return 'ss';
}

function getTagsString(phones: Array<CategoryTagModel.CategoryModel>): string {
    return 'ss';
}