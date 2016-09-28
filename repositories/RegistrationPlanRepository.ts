﻿import * as model from "../models/RegistrationPlanModel";
import {IRegistrationPlanRepository} from "../interfaces/IRegistrationPlanRepository";
import {ErrorCode} from "../ErrorCode";
import * as DB from "../DB";

export class RegistrationPlanRepository implements IRegistrationPlanRepository {
    find(id: number): Promise<model.RegistrationPlanModel> {
        return new Promise(function (resolve, reject) {
            if (id != null) {
                let registrationPlanModel: model.RegistrationPlanModel;
                DB.get().getConnection(function (err, connection) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        let query = connection.query('SELECT * FROM registrationPlan where id=?', [id]);
                        query.on('error', function (err) {
                            reject(err);
                        });
                        query.on('result', function (row) {
                            registrationPlanModel = {
                                id: row.id,
                                active: row.active,
                                detail: row.detail,
                                createdOn: row.createdOn,
                                lastUpdatedOn: row.lastUpdatedOn,
                                name: row.name,
                                price: row.price
                            };
                        });
                        query.on('end', function () {
                            if (registrationPlanModel != null) {
                                connection.query('SELECT * FROM registrationplanfeature WHERE idRegistrationPlan=?', [registrationPlanModel.id], function (err, results, fields) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        registrationPlanModel.features = new Array<model.RegistrationPlanFeatureModel>();
                                        for (var i = 0; i < results.length; i++) {
                                            let feature:model.RegistrationPlanFeatureModel={
                                                active: results[i].active,
                                                createdOn: results[i].createdOn,
                                                feature: results[i].feature,
                                                id: results[i].id,
                                                idRegistrationPlan: results[i].idRegistrationPlan,
                                                lastUpdatedOn: results[i].lastUpdatedOn
                                            };  
                                            registrationPlanModel.features.push(feature);                                         
                                        }
                                        resolve(registrationPlanModel);
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                reject(ErrorCode.PARAMETER_MISSING);
            }
        });
    }

    getAll(): Promise<Array<model.RegistrationPlanModel>> {
        return new Promise(function (resolve, reject) {
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    reject(err);
                }
                else {
                    connection.query('SELECT * FROM registrationplan', function (err, results, fields) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            let registrationPlans: Array<model.RegistrationPlanModel> = new Array<model.RegistrationPlanModel>();
                            for (var i = 1; i < results.length; i++) {
                                registrationPlans.push({
                                    id: results[i].id,
                                    detail: results[i].detail,
                                    name: results[i].name,
                                    createdOn: results[i].createdOn,
                                    price: results[i].price,
                                    lastUpdatedOn: results[i].lastUpdatedOn,
                                    active: results[i].active
                                });
                            }
                            resolve(registrationPlans);
                        }
                    });
                }
            });
        });
    }
}