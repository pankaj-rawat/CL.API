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
                        let images: string = getImagesString(business.images);
                        let phones: string = getPhonesString(business.contactNumbers);
                        let tags: string = getTagsString(business.tags);
                        let operationhours: string = getOperationHourString(business.operationHours);
                        connection.query("Call sp_business_insert(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                            , [business.name, business.contactName, business.contactTitle, business.idStatus, business.streetAddress,
                                business.postalCode, business.idCity, business.idState, business.idCountry, business.webURL, business.latitude,
                                business.longitude, business.description, business.commenceDate, images, phones, tags, operationhours,
                                business.registrationPlan.idRegistrationPlan]
                            , function (err, result) {
                                if (err) {
                                    reject(err);
                                }
                                else {                                   
                                    resolve(result); //TODO::::::::
                                    let businessId: number = result.id;
                                    //this.find(businessId)
                                    //    .then(function (result) {
                                    //        resolve(result);
                                    //    })
                                    //    .catch(function (err) {
                                    //        reject("some error occured while fetching recently saved bussiness.")
                                    //    });                                          
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
    //expected string ->  phone;extension;type,phone1;extension1;type1
    let result: string = undefined;
    let ext: string = "";
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
     return result ;
}

function getImagesString(images: Array<model.BusinessImageModel>): string {
    //expected string -> isProfilePic;imageURL,isProfilePic1;imageURL1
    let result: string = undefined;
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
      return result;
}

function getOperationHourString(operationHours: Array<model.BusinessOperationHourModel>): string {
    //expected string -> day;timeopen;timeclose, day1;timeopen1;timeclose1
    let result: string = undefined;
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
    return result;
}

function getTagsString(tags:Array<CategoryTagModel.TagModel>): string {
    //expected string -> tag,tag1,tag2
    let result: string = undefined;
    for (let tag of tags) {
        if (tag) {
            if (result == null) {
                result = tag.id.toString();
            }
            else {
                result = result + "," +tag.id.toString();
            }

        }
    }
    return result;
}