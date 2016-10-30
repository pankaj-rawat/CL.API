import irepo = require('../interfaces/IUserRepository');
import model = require('../models/UserModel');
import * as DB from "../DB";
import {Logger}  from "../Logger";
import * as CLError from "../CLError";
import {ErrorCode} from "../ErrorCode";

class UserRepository implements irepo.IUserRepository {

    login(username: string, userLocation: string): Promise<model.UserModel> {
        return new Promise(function (resolve, reject) {
            if (userLocation == null) {
                return reject(new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'Missing user location.'));
            }
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
                }
                let encounteredError: boolean = false;
                let userId: number;
                let query = connection.query('Call sp_insert_user_online(?,?)', [username, userLocation]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while recording user login. ' + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 1) {
                        userId = row.idUser;
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (userId != null) {
                            getUser(userId)
                                .then(function (result) {
                                    resolve(result);
                                })
                                .catch(function (err) {
                                    return reject(err);
                                });

                        }
                        else {
                            return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting recorded user detail. UserID:' + username));
                        }
                    }
                });
            });
        });
    }

    logout(userId:number, userLocation: string): Promise<boolean> {
        return new Promise(function (resolve, reject) {
            if (userLocation == null) {
                return reject(new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'Missing user location.'));
            }
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
                }
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_delete_user_online(?,?)', [userId, userLocation]);
                let pass: number;
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while recording user login. ' + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        pass = row.Pass;
                    }
                });
                query.on('end', function () {
                    if (!encounteredError) {
                        if (pass == 1) {
                            resolve(true);
                        }
                        else {
                            return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while signing out.'));
                        }
                    }
                });
            });
        });
    }

    find(id: number): Promise<model.UserModel> {
        return getUser(id);
    }

    create(user: model.UserModel): Promise<model.UserModel> {
        let repoName: string = "UserRepository";
        return new Promise(function (resolve, reject) {
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
                }

                let encounteredError: boolean = false;
                let query = connection.query('CALL sp_user_insert(?,?,?,?,?,?,?)',
                    [user.email, user.password, user.phoneLandLine, user.extension, user.phoneCell, user.idCity, user.subscriptionOptIn]);

                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while saving user. ' + err.message));
                });
                query.on('result', function (row, index) {
                    try {
                        if (index == 0) {
                            user.createdOn = row.createdOn;
                            user.id = row.id;
                            user.idStatus = row.idStatus;
                        }
                    }
                    catch (ex) {
                        encounteredError = true;
                        return reject(new CLError.DBError(ErrorCode.DB_DATA_PARSE_ERROR, 'Error occured while parsing user data. ' + ex.message));
                    }
                });

                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        resolve(user);
                    }
                });
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
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
                }

                let encounteredError: boolean = false;
                let roles: Array<number> = new Array<number>();
                let query = connection.query("Select idrole from userrole where iduser=?", id);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting user roles. ' + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        roles.push(row.idrole);
                    }
                });
                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        if (!roles) {
                            return reject(new CLError.NotFound(ErrorCode.RESOURCE_NOT_FOUND, 'Roles not defined for user.'));
                        }
                        resolve(roles);
                    }
                });
            });
        });
    }

    resetPassword(username: string): Promise<boolean> {
        return new Promise<boolean>(function (resolve, reject) {

        });
    }
};

function getUser(id: number): Promise<model.UserModel> {
    let repoName: string = "UserRepository";
    return new Promise(function (resolve, reject) {
        let user: model.UserModel;
        if (id == null) {
            return reject(new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'User id not supplied.'));
        }

        DB.get().getConnection(function (err, connection) {
            if (err != null) {
                return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
            }

            let encounteredError: boolean = false;
            let query = connection.query('SELECT * FROM user WHERE id = ?', id);
            query.on('error', function (err) {
                encounteredError = true;
                return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting user. ' + err.message));
            });

            //query.on('fields', function (fields) {
            //    Logger.log.info('Error occured in UserRepository - find - id:' + id + '  Error:' + err);
            //});

            query.on('result', function (row, index) {
                try {
                    if (index == 0) {
                        user = {
                            id: row.id,
                            email: row.email,
                            phoneLandLine: row.phoneLandline,
                            phoneCell: row.phoneCell,
                            idStatus: row.idStatus,
                            idCity: row.idCity,
                            createdOn: row.createdOn,
                            lastupdatedOn: row.lastupdatedOn,
                            subscriptionOptIn: row.subscriptionOptIn,
                            subscriptionOptInDate: row.subscriptionOptInDate,
                            subscriptionOptOutDate: row.subscriptionOptOutDate
                        };
                    }
                }
                catch (ex) {
                    encounteredError = true;
                    return reject(new CLError.DBError(ErrorCode.DB_DATA_PARSE_ERROR, 'Error occured while parsing data. ' + ex.message));
                }
            });

            query.on('end', function (result: model.UserModel) {
                connection.release();
                if (!encounteredError) {
                    if (user) {
                        resolve(user);
                    }
                    else {
                        reject(new CLError.NotFound(ErrorCode.RESOURCE_NOT_FOUND, 'User not found.'));
                    }
                }
            });
        });
    });
}

export {UserRepository};