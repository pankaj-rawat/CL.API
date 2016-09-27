import irepo = require("../interfaces/IBusinessRepository");
import model = require("../models/BusinessModel");
import * as db from "../DB";
import {Logger as logger} from "../Logger";

export class BusinessRepository implements irepo.IBusinessRepository {
    register(business: model.BusinessModel): Promise<model.BusinessModel> {
        return new Promise(function (resolve, reject) {
            try {
                db.get().getConnection(function (err, connection) {
                    if (err != null) {
                        logger.log.error(err.message);
                        reject(err);
                    }
                    else {
                        let query = connection.query("Call xxxxx(?????????)",
                            [business]);
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