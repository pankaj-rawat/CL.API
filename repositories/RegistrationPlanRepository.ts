import * as model from "../models/RegistrationPlanModel";
import {IRegistrationPlanRepository} from "../interfaces/IRegistrationPlanRepository";
import * as DB from "../DB";
import * as CLError from "../CLError";

export class RegistrationPlanRepository implements IRegistrationPlanRepository {
    find(id: number): Promise<model.RegistrationPlanModel> {
        return new Promise<model.RegistrationPlanModel>(function (resolve, reject) {
            if (id != null) {
                let registrationPlanModel: model.RegistrationPlanModel;
                DB.get().getConnection(function (err, connection) {
                    if (err) {
                        let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                        clError.stack = err.stack;
                        return reject(clError);
                    }
                    else {
                        let query = connection.query('SELECT * FROM registration_plan where id=?', [id]);
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
                                connection.query('SELECT * FROM registration_plan_feature WHERE idRegistrationPlan=?', [registrationPlanModel.id], function (err, results, fields) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        registrationPlanModel.features = new Array<model.RegistrationPlanFeatureModel>();
                                        for (var i = 0; i < results.length; i++) {
                                            let feature: model.RegistrationPlanFeatureModel = {
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
                reject(CLError.ErrorCode.REQUIRED_PARAM_MISSING);
            }
        });
    }

    getAll(): Promise<Array<model.RegistrationPlanModel>> {
        return new Promise<Array<model.RegistrationPlanModel>>(function (resolve, reject) {
            let registrationPlans: Array<model.RegistrationPlanModel> = new Array<model.RegistrationPlanModel>();
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('SELECT * FROM registration_plan');
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting plans. ' + err.message));
                });
                query.on('result', function (row, index) {
                    try {
                        if (index == 0) {
                            let plan: model.RegistrationPlanModel = {
                                id: row.id,
                                detail: row.detail,
                                name: row.name,
                                createdOn: row.createdOn,
                                price: row.price,
                                lastUpdatedOn: row.lastUpdatedOn,
                                active: row.active
                            };                            
                            registrationPlans.push(plan);
                        }
                    }
                    catch (ex) {
                        encounteredError = true;
                        return reject(new CLError.DBError(CLError.ErrorCode.DB_DATA_PARSE_ERROR));
                    }
                });
                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        if (registrationPlans.length == 0) {
                            reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, 'Plans not found.'));
                        } else {
                            resolve(registrationPlans);
                        }
                    }
                });
            });
        });
    }
}