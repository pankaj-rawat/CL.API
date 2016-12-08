import irepo = require('../interfaces/IUserRepository');
import model = require('../models/UserModel');
import * as DB from "../DB";
import {Logger}  from "../Logger";
import * as CLError from "../CLError";
import {RepoResponse} from "../RepoResponse";
import {CLMailer} from "../CLMailer";
import jwt = require('jwt-simple');
import config = require('config');
import bcrypt = require('bcryptjs');
import {CLConstants} from "../CLConstants";


class UserRepository implements irepo.IUserRepository {

    login(email: string, userLocation: string): Promise<model.UserModel> {
        return new Promise<model.UserModel>(function (resolve, reject) {
            if (userLocation == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'Missing user location.'));
            }
            if (email == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'user email missing.'));
            }
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                } 
                let encounteredError: boolean = false;
                let userId: number;
                let query = connection.query('Call sp_insert_user_online(?,?)', [email, userLocation]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while recording user login. ' + err.message));
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
                            getUser(0, 1, CLConstants.SYSTEM_USER,userId)
                                .then(function (result: RepoResponse) {
                                    resolve(result.data[0]);
                                })
                                .catch(function (err) {
                                    return reject(err);
                                });
                        }
                        else {
                            return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting recorded user detail. UserID:' + email));
                        }
                    }
                });
            });
        });
    }

    logout(userId: number, userLocation: string): Promise<boolean> {
        return new Promise<boolean>(function (resolve, reject) {
            if (userLocation == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'Missing user location.'));
            }
            if (userId == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'User id missing.'));
            }
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_delete_user_online(?,?)', [userId, userLocation]);
                let pass: number;
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while recording user login. ' + err.message));
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
                            return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while signing out.'));
                        }
                    }
                });
            });
        });
    }

    get(id: number,requestedBy:number): Promise<model.UserModel> {
        return new Promise<model.UserModel>(function (resolve, reject) {
            if (id == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'User id not supplied.'));
            }
            getUser(0, 1, requestedBy, id)
                .then(function (result: RepoResponse) {
                    resolve(result.data[0]);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    }

    getAll(offset: number, limit: number,requestedBy:number): Promise<RepoResponse> {
        return getUser(offset, limit,requestedBy);
    }

    create(user: model.UserModel): Promise<model.UserModel> {
        let repoName: string = "UserRepository";
        return new Promise<model.UserModel>(function (resolve, reject) {
            //check for required parameters
            if (user.password == null || user.password=='') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "Password missing."));
            }
            if (user.email == null || user.email == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "email missing."));
            }          
            if (user.idCity == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "User city missing."));
            }

            if (user.subscriptionOptIn == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "User subscription option missing."));
            }

            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }

                let encounteredError: boolean = false;
                let query = connection.query('CALL sp_insert_user(?,?,?,?,?,?,?)',
                    [user.email, getHashedPwd(user.password), user.phoneLandLine, user.extension, user.phoneCell, user.idCity, user.subscriptionOptIn]);

                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while saving user. ' + err.message));
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
                        return reject(new CLError.DBError(CLError.ErrorCode.DB_DATA_PARSE_ERROR));
                    }
                });

                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        if (user.id == null) {
                            reject(new CLError.CustomError("No data saved",'500',CLError.ErrorCode.RESOURCE_NOT_FOUND, 'Error occured while saving user.'));
                        } else {
                            resolve(user);
                        }
                    }
                });
            });
        });
    }

    update(user: model.UserModel,requestedBy:number): Promise<model.UserModel> {
        return new Promise<model.UserModel>(function (resolve, reject) {
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

    remove(id: number, requestedBy: number): Promise<number> {
        return new Promise<number>(function (resolve, reject) {
        });
    }

    forgetPassword(email: string, location: string, resetURL: string): Promise<boolean> {
        return new Promise<boolean>(function (resolve, reject) {
            if (email == null || email == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "email missing."));
            }
            if (location == null || location == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "location missing."));
            }
            if (resetURL == null || resetURL == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, "resetURL missing."));
            }

            let dateObj = new Date();
            let daysToLinkExpiry: number = process.env.FORGET_PWD_DAYS_TO_LINK_EXP || config.get("forget-pwd.daysToLinkExp");
            let linkExpiryDate = new Date(new Date().getTime() + (daysToLinkExpiry * 24 * 60 * 60 * 1000));

            getUser(0, 1, CLConstants.SYSTEM_USER, null, email)
                .then(function (result: RepoResponse) {
                    let idUser: number = result.data[0].id;                   
                    let token = jwt.encode({
                        exp: linkExpiryDate
                        , id: idUser

                    }, String(process.env.TOKEN_KEY || config.get("token.key")));

                    //append token as querystring with resetURL.
                    if (resetURL.includes('?')) {
                        resetURL = resetURL + '&id=' + idUser + '&fpt=' + token;
                    }
                    else {
                        resetURL = resetURL + '?id=' + idUser + '&fpt=' + token;
                    }

                    let clmailer: CLMailer = new CLMailer();
                    let msg: string = "Please follow the below link to reset password.<br><br> <a href='" + resetURL + "'>" + resetURL + "</a>";
                    clmailer.sendMail(email, 'Password reste link.', null, msg)
                        .then(function (result: string) {
                            resolve(true);
                        })
                        .catch(function (err) {
                            reject(err);
                        });


                })
                .catch(function (err) {
                    return reject(err);
                });
        });
    }

    updatePassword(idUser: number, location: string, newPwd: string, requestedBy?: number, fpToken?: string): Promise<boolean> {
        return new Promise<boolean>(function (resolve, reject) {
            let affectedRow:number;
            if (idUser == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, " User id missing."));
            }
            if (location == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, " User location missing."));
            }
            if (newPwd == null || newPwd == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, " Password missing."));
            }

            if ((requestedBy == null || requestedBy <= 0) && (fpToken == null || fpToken=='')) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, " Missing required parameters."));
            }

            //check for valid reset token.
            if (fpToken != null) {
               try {
                    let decoded = jwt.decode(fpToken, String(process.env.TOKEN_KEY || config.get("token.key")));
                    if (decoded.id != idUser) {
                        return reject(new CLError.BadRequest(CLError.ErrorCode.INVALID_PARAM_VALUE, "token not associated with the User."));
                    }
                    else {
                        requestedBy = decoded.id; 
                    }
                    if (new Date(decoded.exp).getTime() <= (new Date()).getTime()) {
                        return reject(new CLError.BadRequest(CLError.ErrorCode.PASSWORD_RESET_LINK_EXPIRED));
                    }                        
                }
                catch (ex) {                 
                    return reject(new CLError.BadRequest(CLError.ErrorCode.INVALID_PARAM_VALUE));
                }
            }

            //'sp_update_user_password' need to create this sp
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('CAll sp_update_user_password(?,?,?,?);', [idUser, getHashedPwd(newPwd), location, requestedBy]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while resetting pwd. ' + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        affectedRow = row.row_affected;
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (affectedRow>0) {
                            return resolve(true);
                        }
                        else {
                            return reject(new CLError.CustomError("Password not updated", 200, "300", " Password not updated"));
                        }
                    }
                });
            });
        });
    }

};

function getUser(offset: number, limit: number,requestBy:number, idUser?: number,email?:string): Promise<RepoResponse> {
    return new Promise(function (resolve, reject) {
        let users: Array<model.UserModel> = new Array<model.UserModel>();
        if (offset==null || offset < 0 || limit==null || limit==0) {
            return reject(new CLError.BadRequest(CLError.ErrorCode.INVALID_PARAM_VALUE, "Invalid value supplied for offset\limit params."));
        }

        if (requestBy == null) {
            return reject(new CLError.BadRequest(CLError.ErrorCode.INVALID_PARAM_VALUE, "Specify requestor."));
        }
        DB.get().getConnection(function (err, connection) {
            if (err != null) {
                let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                clError.stack = err.stack;
                return reject(clError);
            }

            let encounteredError: boolean = false;
            let recCount: number = 0;
            let query = connection.query('SET @rCount=0; CAll sp_select_user(@rCount,?,?,?,?,?); select @rCount rcount;', [offset, limit, idUser, email, requestBy]);
            query.on('error', function (err) {
                encounteredError = true;
                return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting user. ' + err.message));
            });

            //query.on('fields', function (fields) {
            //    Logger.log.info('Error occured in UserRepository - find - id:' + id + '  Error:' + err);
            //});

            query.on('result', function (row, index) {
                try {
                    if (index == 1) {
                        let user: model.UserModel = {
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
                        users.push(user);
                    }
                    if (index == 3) {
                        recCount = row.rcount;
                    }
                }
                catch (ex) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_DATA_PARSE_ERROR));
                }
            });

            query.on('end', function (result: model.UserModel) {
                connection.release();
                if (!encounteredError) {
                    if (users.length > 0) {
                        let res: RepoResponse = {
                            data: users
                            , recordCount: recCount
                        };
                        resolve(res);
                    }
                    else {
                        reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, 'User not found.'));
                    }
                }
            });
        });
    });
}

function getHashedPwd(pwd: string):string {
    let salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(pwd, salt);
}
export {UserRepository};