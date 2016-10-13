import irepo = require("../interfaces/IAuthRepository");
import {UserRepository} from  "./UserRepository";
import jwt = require('jwt-simple');
import config = require('config');
import * as DB from "../DB";
import {Logger}  from "../Logger";
import * as model  from "../models/AuthModel";
import bcrypt = require('bcryptjs');
import {Role} from "../Definitions";
import * as CLError from "../CLError";
import {ErrorCode} from "../ErrorCode";

export class AuthRepository implements irepo.IAuthRepository {

    login(username: string, password: string): Promise<model.AuthModel> {
        let auth: model.AuthModel;
        return new Promise(function (resolve, reject) {
            if (password== null || password.trim() == '') //no need to go to DB
            {
                //no need to check, just return empty model
                Logger.log.info('blank password supplied');
                reject(auth);
            }
            else {
                let validatePromise: Promise<model.AuthUsermodel> = authenticateUser(username, password);
                validatePromise.then(function (result: model.AuthUsermodel) {
                    if (result != null) {
                        let expiryDate: Date = expiresIn(Number(process.env.MINUTESTOEXPIRE_USER || config.get("token.minutesToExpire-user")));
                        auth = {
                            expires: expiryDate,
                            token: genToken(expiryDate),
                            user: result
                        };
                    }
                    resolve(auth);
                });
                validatePromise.catch(function (error) {
                    reject(error);
                });
            }
        });
    }

    validateUser(userId: number, res: (userRoles: Array<number>) => void): void {
        let userRepo: UserRepository = new UserRepository();
        userRepo.getUserRoles(userId)
            .then(function (result: Array<number>) {
                res(result);
            })
            .catch(function (err) {
                Logger.log.error(err);
                res(null);
            });
    }

    connect(clientId:number,clientName: string, clientKey: string): Promise<model.AuthModel> {
        let auth: model.AuthModel;
        return new Promise(function (resolve, reject) {
            if (clientKey == null || clientKey.trim())
            {
                return (new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'Missing  client key.'));
            }
            //either clientKey or clientname must supplied
            if ((clientId == null) && (clientName == null || clientName.trim() == '') ) //no need to go to DB
            {
                //no need to check, just return error
                return (new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'Missing  client\'s id\name.'));
            }

            let validatePromise: Promise<model.AuthModel> = authenticateClient(clientId, clientName, clientKey);
            validatePromise.then(function (result: model.AuthModel) {
                resolve(result);
            });
            validatePromise.catch(function (error) {
                reject(error);
            });
        });
    }

}

function authenticateUser(username: string, password: string): Promise<model.AuthUsermodel> {
    return new Promise(function (resolve, reject) {
        DB.get().getConnection(function (err, connection) {
            let pwd: string;
            let userId: number;
            let user: model.AuthUsermodel;
            let userRoles: Array<number> = new Array<number>();
            if (err != null) {
                connection.release();
                Logger.log.info("Error occur while validating password. Error:" + err.message);
                reject(err);
            }
            else {
                let encounteredError: boolean = false;
                let query = connection.query("CALL sp_user_select_pwd(?)", [username]);
                query.on('error', function (err) {
                    Logger.log.info("Error occur while validating password. Error:" + err.message);
                    encounteredError = true;
                    reject(err);
                });

                query.on('result', function (row,index) {
                    if (index==0) {
                        pwd = row.password;
                        userId = row.id;
                        userRoles.push(row.role);
                    }
                });
                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        if (pwd != null) {
                            if (bcrypt.compareSync(password, pwd)) { //this is taking time
                                user = {
                                    roles: userRoles,
                                    userName: username,
                                    id: userId
                                };
                            }
                            else {
                                reject(new Error("authentication failed."));
                            }
                        }
                        else {
                            reject(new Error("authentication failed."));
                        }
                        resolve(user);
                    }
                });
            }
        });
    });
}

function authenticateClient(clientId:number, clientName: string, clientKey: string): Promise<model.AuthModel> {
    return new Promise(function (resolve, reject) {
        let dbError: CLError.DBError = new CLError.DBError();
        DB.get().getConnection(function (err, connection) {
            if (err != null) {
                dbError = new CLError.DBError();
                dbError.errorCode = ErrorCode.DB_CONNECTION_FAIL;
                dbError.message = 'Error occur while obtaining database connection.';
                dbError.stack = err.stack;
                connection.release();     
                return reject(dbError);           
            }
            let authModel: model.AuthModel;
            let encounteredError: boolean = false;
            let query = connection.query("CALL sp_api_client_select(?,?)", [clientName, clientId]);
            query.on('error', function (err) {
                encounteredError = true;
                dbError = new CLError.DBError();
                dbError.errorCode = ErrorCode.DB_QUERY_EXECUTION_ERROR;
                dbError.message = 'Error occured while authenticating client.';
                dbError.stack = err.stack;                
                return reject(err);
            });

            let blocked: boolean;
            let id: number;
            let ck: string;
            let allowRefresh: boolean;
            query.on('result', function (row, index) {
                try {
                    if (index == 0) {
                        id = row.id;
                        blocked = row.blocked;
                        ck = row.clientKey;
                        allowRefresh = row.allowRefresh;
                    }
                }
                catch (ex) {
                    encounteredError = true;
                    connection.release();
                    dbError = new CLError.DBError();
                    dbError.errorCode = ErrorCode.DB_DATA_PARSE_ERROR;
                    dbError.message = 'Error occured while parsing data.';
                    dbError.stack = err.stack;  
                    return reject(err);              
                }
            });
            query.on('end', function () {
                connection.release();
                if (!encounteredError) {
                     //TODO: need to save apiKey in encrypted form as we are doing in user password.
                    if (id > 0 && ck == clientKey) {                       
                        //>0 means called for auto refresh
                        if (clientId > 0 && !allowRefresh) {                           
                            reject(new CLError.Unauthorized(ErrorCode.USER_NOT_AUTHORIZE,"Authentication failed. Client is not allowed for autorefresh."));
                        }
                        else if (!blocked) {
                            let expiryDate: Date = expiresIn(Number(process.env.MINUTESTOEXPIRE_CLIENT || config.get("token.minutesToExpire-client")));
                            authModel = {
                                expires: expiryDate
                                , token: genClientToken(id,clientKey, expiryDate)
                            };
                            resolve(authModel);
                        }
                        else {
                            reject(new CLError.Unauthorized(ErrorCode.USER_NOT_AUTHORIZE, "Authentication failed. Client is blocked."));
                        }
                    }
                    else {
                        reject(new CLError.Unauthorized(ErrorCode.USER_NOT_AUTHORIZE, "Authentication failed."));
                    }
                }
            });
        });
    });
}

// private method
function genToken(expires: Date): string {
    let token = jwt.encode({
        exp: expires
    }, String(process.env.TOKEN_KEY || config.get("token.key")));
    return token;
}

// private method
function genClientToken(clientid:number,clientKey: string, expires: Date): string {
    let token = jwt.encode({
        client: clientKey,
        exp: expires,
        id: clientid
    }, String(process.env.TOKEN_KEY || config.get("token.key")));
    return token;
}

function expiresIn(minutes: number): Date {
    let dateObj = new Date(); //TODO: need to check for UTC
    return new Date(dateObj.getTime() + minutes * 60000);
}
