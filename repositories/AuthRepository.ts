import irepo = require("../interfaces/IAuthRepository");
import jwt = require('jwt-simple');
import config = require('config');
import * as DB from "../DB";
import {Logger}  from "../Logger";
import * as model  from "../models/AuthModel";
import bcrypt = require('bcryptjs');
import * as def from "../Definitions";
import * as CLError from "../CLError";

export class AuthRepository implements irepo.IAuthRepository {

    authenticateUser(email: string, password: string, userLocation:string): Promise<model.AuthModel> {
        return new Promise<model.AuthModel>(function (resolve, reject) {
            if (userLocation == null || userLocation.trim() == '') {
                //will be used later for auditing
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'Location not supplied'));
            }

            if (password == null || password.trim() == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'Password not supplied'));
            }
            if (email == null || email.trim() == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'User id not supplied'));
            }

            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let pwd: string;
                let userId: number;
                let encounteredError: boolean = false;

                let query = connection.query("CALL sp_select_user_login(?)", [email]);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occur while validating password. ' + err.message);
                    clError.stack = err.stack;
                    return reject(clError);
                });

                query.on('result', function (row, index) {
                    try {
                        if (index == 0) {
                            pwd = row.password;
                            userId = row.id;
                        }
                    }
                    catch (ex) {
                        encounteredError = true;
                        let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_DATA_PARSE_ERROR);
                        clError.stack = err.stack;
                        return reject(clError);
                    }
                });
                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        if (userId == null) //means supplied user not exist in system
                        {
                            return reject(new CLError.Unauthorized(CLError.ErrorCode.USER_NOT_FOUND));
                        }
                        if (bcrypt.compareSync(password, pwd)) { //this is taking time
                            let expiryDate: Date = expiresIn(Number(process.env.MINUTESTOEXPIRE_USER || config.get("token.minutesToExpire_user")));
                            let auth: model.AuthModel = {
                                expires: expiryDate,
                                token: genToken(userId, expiryDate)
                            };
                            resolve(auth);
                        }
                        else {
                            return reject(new CLError.Unauthorized(CLError.ErrorCode.USER_AUTHENTICATION_FAILED));
                        }
                    }
                });
            });
        });
    }

    connect(clientId: number, clientName: string, clientKey: string): Promise<model.AuthModel> {
        let auth: model.AuthModel;
        return new Promise<model.AuthModel>(function (resolve, reject) {
            if (clientKey == null || clientKey.trim() == '') {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'Missing  client key.'));
            }
            //either clientKey or clientname must supplied
            if ((clientId == null || clientId <= 0) && (clientName == null || clientName.trim() == '')) //no need to go to DB
            {
                //no need to check, just return error
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'Missing  client\'s id\name.'));
            }
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }

                let encounteredError: boolean = false;
                let query = connection.query("CALL sp_select_api_client(?,?)", [clientName, clientId]);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, err.message);
                    clError.stack = err.stack;
                    return reject(clError);
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
                        let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_DATA_PARSE_ERROR);
                        clError.stack = err.stack;
                        return reject(clError);
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (id == null) {
                            //>0 means auto refresh 
                            if (clientId > 0) {
                                return reject(new CLError.Unauthorized(CLError.ErrorCode.CLIENT_AUTO_AUTH_FAILED));
                            }
                            return reject(new CLError.NotFound(CLError.ErrorCode.CLIENT_NOT_FOUND));
                        }
                        //TODO: need to save apiKey in encrypted form as we are doing in user password.
                        if (ck != clientKey) {                            
                            return reject(new CLError.Unauthorized(CLError.ErrorCode.INVALID_CLIENT_KEY));
                        }
                        if (blocked) {
                            return reject(new CLError.Forbidden(CLError.ErrorCode.CLIENT_BLOCKED));
                        }

                        //>0 means called for auto refresh
                        if (clientId > 0) {
                            if (!allowRefresh) {
                                return reject(new CLError.Forbidden(CLError.ErrorCode.CLIENT_AUTO_AUTH_DISABLED));
                            }
                        }

                        let expiryDate: Date = expiresIn(Number(process.env.MINUTESTOEXPIRE_CLIENT || config.get("token.minutesToExpire_client")));
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

    getOnlinestatus(userId: number, location: string): Promise<def.UserOnlineStatus> {
        return new Promise<def.UserOnlineStatus>(function (resolve, reject) {
            let status: number;          
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_select_user_online_status(?,?)', [userId, location]);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, err.message);
                    clError.stack = err.stack;
                    return reject(clError);
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        status = row.OnlineStatus;                     
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {                       
                        resolve(status);
                    }
                });
            });
        });
    }

    getUserRoles(userId: number): Promise<Array<number>> {
        return new Promise<Array<number>>(function (resolve, reject) {
            let roleIds: Array<number> = new Array<number>();
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_select_user_role(?)', [userId]);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, err.message);
                    clError.stack = err.stack;
                    return reject(clError);
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        let roleId: number = row.idRole;
                        roleIds.push(roleId);
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        resolve(roleIds);
                    }
                });
            });
        });
    }

    refreshAccessToken(userId: number): model.AuthModel {
        let expiryDate: Date = expiresIn(Number(process.env.MINUTESTOEXPIRE_USER || config.get("token.minutesToExpire_user")));
        let auth: model.AuthModel = {
            token: genToken(userId, expiryDate)
            ,expires:expiryDate
        }
        return auth;
    }

    getRoleAccessList(): Promise<Array<model.RoleAccess>> {
        return this.getResourceRoleAccess('',[]);
    }

    getResourceRoleAccess(resourceName: string, roleIds: Array<number>): Promise<Array<model.RoleAccess>> {
        return new Promise<Array<model.RoleAccess>>(function (resolve, reject) {
            //check for cache first.
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let roleAccesses: Array<model.RoleAccess> = new Array<model.RoleAccess>();
                let encounteredError: boolean = false;
                //TODO: need to implement caching
                let query = connection.query('Call sp_select_roll_access(?,?)', [resourceName, roleIds.join(',')]);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error while getting roles access.' + err.message);
                    clError.stack = err.stack;
                    return reject(clError);
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        let roleAccess: model.RoleAccess = {
                            actionMask: row.actionMask,
                            idRole: row.idRole,
                            idResource: row.idResource,
                            resource: row.resource
                        }
                        roleAccesses.push(roleAccess);
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        resolve(roleAccesses);
                    }
                });
            });
        });
    }
}

// private method
function genToken(userid: number, expires: Date): string {
    let token = jwt.encode({
        exp: expires
        , id: userid
        
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
