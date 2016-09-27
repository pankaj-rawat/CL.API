import irepo = require('../interfaces/IUserRepository');
import model = require('../models/UserModel');
import * as DB from "../DB";
import {Logger}  from "../Logger";

class UserRepository implements irepo.IUserRepository {
    find(id: number): Promise<model.UserModel> {
        let repoName: string = "UserRepository";   
        return new Promise(function (resolve, reject) {
            let user: model.UserModel;
            if (id != null) {
                 try {
                    DB.get().getConnection(function (err, connection) {
                        if (err != null) {
                            Logger.log.info('Error occured in ' + repoName + ' - find - id:' + id + '  Error:' + err);
                            reject(err);
                        }
                        else {
                            let query = connection.query('SELECT * FROM user WHERE id = ?', id);
                            query.on('error', function (err) {
                                Logger.log.info('Error occured in ' + repoName + ' - find - id:' + id + '  Error:' + err);
                                reject(err);
                            });

                            //query.on('fields', function (fields) {
                            //    Logger.log.info('Error occured in UserRepository - find - id:' + id + '  Error:' + err);
                            //});

                            query.on('result', function (row, index) {
                                user = {
                                    id: row.Id,
                                    email: row.email,
                                    phoneLandLine: row.phoneLandLine,
                                    phoneCell: row.phoneCell,
                                    idStatus: row.idStatus,
                                    idCity: row.idCity,
                                    createdOn: row.createdOn,
                                    lastupdatedOn: row.lastupdatedOn,
                                    subscriptionOptIn: row.subscriptionOptIn,
                                    subscriptionOptInDate: row.subscriptionOptInDate,
                                    subscriptionOptOutDate: row.subscriptionOptOutDate
                                };
                            });

                            query.on('end', function (result: model.UserModel) {
                                resolve(user);
                            });
                        }
                    });
                }
                catch (err) {
                    reject(err);
                }
            }
            else {
                reject(new Error('user id not supplied'));
            }
        });
    }
    create(user: model.UserModel): Promise<model.UserModel> {
        let repoName: string="UserRepository";   
        return new Promise(function (resolve, reject) {
            DB.get().getConnection(function (err, connection){
                if (err != null) {
                    Logger.log.info('Error occured in ' + repoName + ' - Signup - user:' + user.email + '  Error:' + err);
                    reject(err);
                }
                else {
                    let query = connection.query('CALL sp_user_insert(?,?,?,?,?,?,?)',
                        [user.email, user.password, user.phoneLandLine,user.extension, user.phoneCell, user.idCity, user.subscriptionOptIn]);

                    query.on('error', function (err) {
                        Logger.log.info('Error occured in ' + repoName + ' - Create -' + user.email + '  Error:' + err);
                        reject(err);
                    });
                    query.on('result', function (row) {
                        //to exclude OkPacket
                        if (row.id != null) {
                            user.createdOn = row.createdOn;
                            user.id = row.id;
                            user.idStatus = row.idStatus;
                        }
                    });

                    query.on('end', function (result) {
                        resolve(user);
                        connection.release();
                    });
                }
            });
        });
    }
    update(user: model.UserModel): Promise<model.UserModel> {
        return new Promise(function (resolve, reject) {
            let user: model.UserModel;
            DB.get().getConnection(function (err, connection) {
                //if (err != null) {
                //    Logger.log.info('Error occured in CityRepository - find - id:' + + '  Error:' + err);
                //    reject(err);
                //}
                //else {
                //    let query = connection.query('SELECT * FROM user WHERE id = ?');

                //    query.on('error', function (err) {
                //        Logger.log.info('Error occured in CityRepository - find - id:' + + '  Error:' + err);
                //        reject(err);
                //    });

                //    query.on('fields', function (fields) {
                //        Logger.log.info('Error occured in CityRepository - find - id:' + + '  Error:' + err);
                //    });

                //    query.on('result', function (row, result) {
                //    });

                //    query.on('end', function (result) {
                //    });
                //}
            });
        });
    }  
    remove(id: number): Promise<number> {
        return new Promise(function (resolve, reject) {
        });
    }

    getUserRoles(id: number): Promise<Array<number>> {
        return new Promise(function (resolve, reject) {
            if (id != null) {
                try {
                    DB.get().getConnection(function (err, connection) {
                        if (err != null) {
                            Logger.log.error(err.message);
                            reject(err);
                        }
                        else {
                            let roles:Array<number>=new Array<number>();
                            let query = connection.query("Select idrole from userrole where iduser=?", id);
                            query.on('error', function (err) {
                                Logger.log.error(err.message);
                                reject(err);
                            });
                            query.on('result', function (row) {
                                roles.push(row.idrole);
                            });
                            query.on('end', function (result) {
                                resolve(roles);
                            });
                        }
                    });
                }
                catch (err) {
                    Logger.log.error(err);
                    reject(err);
                }
            }
            else {
                Logger.log.info("No user supplied");
                reject(new Error("No user supplied."));
            }
        });
    }

    getAllByCity(cityId: number): Promise<model.UserModel[]> {
        return new Promise(function (resolve, reject) {
        });
    }

    getAllByState(stateId: number): Promise<model.UserModel[]> {
        return new Promise(function (resolve, reject) {
            //    var users = [];
            //    var user: Model.User = { salutation: "Mr.", name: "Raw", age: 10 };
            //    users.push(user);
            //    var user: Model.User = { salutation: "Mrs.", name: "Raw11", age: 39 };
            //    users.push(user);
            //    return users;
        });
    }

    resetPasswordRequest(username: string): Promise<boolean> {
        return new Promise<boolean>(function (resolve, reject) {

        });
    }
};

export {UserRepository};