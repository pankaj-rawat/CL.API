import irepo = require("../interfaces/IBusinessRepository");
import model = require("../models/BusinessModel");
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
                                connection.query("Call sp_business_insert(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                                    [business.name, business.contactName, business.contactTitle, business.idStatus, business.streetAddress,
                                        business.postalCode, business.idCity, business.idState, business.idCountry, business.webURL, business.latitude,
                                        business.longitude, business.description, business.commenceDate], function (err, result) {
                                            if (err) {
                                                connection.rollback(function () {
                                                    reject(err);
                                                });
                                            }
                                            else {
                                                let businessId: number = result.insertId;
                                                //connection.query('', , function (err, result) {

                                                //});
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
    }
    unRegister(id: number): Promise<number> {
        return new Promise(function (resolve, reject) {
        });
    }
    update(business: model.BusinessModel): Promise<model.BusinessModel> {
        return new Promise(function (resolve, reject) {
        });
    }

    addOffer(offer: model.BusinessOfferModel): Promise<model.BusinessOfferModel> {
        return new Promise(function (resolve, reject) {
        });
    }
    updateOffer(offer: model.BusinessOfferModel): Promise<model.BusinessOfferModel> {
        return new Promise(function (resolve, reject) {
        });
    }
    deactivateOffer(id: number): Promise<boolean> {
        return new Promise(function (resolve, reject) {
        });
    }
}