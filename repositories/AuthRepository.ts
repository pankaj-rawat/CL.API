import irepo = require("../interfaces/IAuthRepository");
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
            if (password == null || password.trim() == '') {
                return reject(new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'Password not supplied'));
            }
            if (username == null || username.trim() == '') {
                return reject(new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'User id not supplied'));
            }

            authenticateUser(username, password)
                .then(function (result: model.AuthUsermodel) {
                    let expiryDate: Date = expiresIn(Number(process.env.MINUTESTOEXPIRE_USER || config.get("token.minutesToExpire-user")));
                    auth = {
                        expires: expiryDate,
                        token: genToken(result.id,expiryDate),
                        user: result
                    };
                    resolve(auth);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    //validateUser(userId: number, res: (error:Object,userRoles: Array<number>) => void): void {
    //    let userRepo: UserRepository = new UserRepository();
    //    userRepo.getUserRoles(userId)
    //        .then(function (result: Array<number>) {
    //            res(null,result);
    //        })
    //        .catch(function (err) {
    //            res(err,null);
    //        });
    //}

    connect(clientId: number, clientName: string, clientKey: string): Promise<model.AuthModel> {
        let auth: model.AuthModel;
        return new Promise(function (resolve, reject) {
            if (clientKey == null || clientKey.trim() == '') {
                return reject(new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'Missing  client key.'));
            }
            //either clientKey or clientname must supplied
            if ((clientId == null || clientId <= 0) && (clientName == null || clientName.trim() == '')) //no need to go to DB
            {
                //no need to check, just return error
                return reject(new CLError.BadRequest(ErrorCode.REQUIRED_PARAM_MISSING, 'Missing  client\'s id\name.'));
            }
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
                }

                let encounteredError: boolean = false;
                let query = connection.query("CALL sp_api_client_select(?,?)", [clientName, clientId]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while authenticating client. ' + err.message));
                });

                let authModel: model.AuthModel;
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
                        return reject(new CLError.DBError(ErrorCode.DB_DATA_PARSE_ERROR, 'Error occured while parsing data. ' + ex.message));
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        //TODO: need to save apiKey in encrypted form as we are doing in user password.
                        if (id==null || id == 0) {
                            return reject(new CLError.Unauthorized(ErrorCode.CLIENT_NOT_FOUND, "Authentication failed. API client not found."));
                        }
                        if (ck != clientKey) {
                            return reject(new CLError.Unauthorized(ErrorCode.INVALID_CLIENT_KEY, "Authentication failed. Client key is not valid."));
                        }
                        if (blocked) {
                            return reject(new CLError.Unauthorized(ErrorCode.CLIENT_BLOCKED, "Authentication failed. Client is blocked."));
                        }

                        //>0 means called for auto refresh
                        if (clientId > 0)  {
                            if (!allowRefresh) {
                                return reject(new CLError.Unauthorized(ErrorCode.CLIENT_AUTO_AUTH_DISABLED, "Auto authentication failed. Client is not allowed for autorefresh."));
                            }
                        }
                        
                        let expiryDate: Date = expiresIn(Number(process.env.MINUTESTOEXPIRE_CLIENT || config.get("token.minutesToExpire-client")));
                        authModel = {
                            expires: expiryDate
                            , token: genClientToken(id, clientKey, expiryDate)
                        };
                        resolve(authModel);
                    }
                });
            });
        });
    }
}

function authenticateUser(username: string, password: string): Promise<model.AuthUsermodel> {
    return new Promise(function (resolve, reject) {
        DB.get().getConnection(function (err, connection) {
            if (err != null) {
                return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Database connection failed. ' + err.message));
            }
            let pwd: string;
            let userId: number;
            let user: model.AuthUsermodel;
            let userRoles: Array<number> = new Array<number>();
            let encounteredError: boolean = false;

            let query = connection.query("CALL sp_user_select_pwd(?)", [username]);
            query.on('error', function (err) {
                encounteredError = true;
                return reject(new CLError.DBError(ErrorCode.DB_CONNECTION_FAIL, 'Error occur while validating password. ' + err.message));
            });

            query.on('result', function (row, index) {
                try {
                    if (index == 0) {
                        pwd = row.password;
                        userId = row.id;
                        userRoles.push(row.role);
                    }
                }
                catch (ex) {
                    encounteredError = true;
                    return reject(new CLError.DBError(ErrorCode.DB_DATA_PARSE_ERROR, 'Error occured while parsing data. ' + ex.message));
                }
            });
            query.on('end', function (result) {
                connection.release();
                if (!encounteredError) {
                    if (userId == null) //means supplied user not exist in system
                    {
                        return reject(new CLError.Unauthorized(ErrorCode.USER_NOT_FOUND,'Authentication failed. User not found.'));
                    }
                    if (bcrypt.compareSync(password, pwd)) { //this is taking time
                        user = {
                            roles: userRoles,
                            userName: username,
                            id: userId
                        };
                    }
                    else {
                        return reject(new CLError.Unauthorized(ErrorCode.USER_NOT_AUTHENTICATED, 'Authentication failed.'));
                    }
                    resolve(user);
                }
            });
        });
    });
}

// private method
function genToken(userid:number, expires: Date): string {
    let token = jwt.encode({
        exp: expires
        ,id:userid
    }, String(process.env.TOKEN_KEY || config.get("token.key")));
    return token;
}

// private method
function genClientToken(clientid: number, clientKey: string, expires: Date): string {
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
