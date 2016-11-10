import express = require('express');

export enum ErrorCode {
    REQUIRED_PARAM_MISSING = 10001,
    DB_CONNECTION_FAIL = 10002,
    DB_QUERY_EXECUTION_ERROR = 10003,
    DB_DATA_PARSE_ERROR = 10004,
    USER_NOT_FOUND = 10005,
    USER_NOT_AUTHENTICATED = 10006,
    USER_NOT_AUTHORIZED = 10007,
    USER_IDENTIFICATION_MISSING = 10008,
    USER_TOKEN_EXPIRED = 10009,
    CLIENT_NOT_FOUND = 10010,
    INVALID_CLIENT_KEY = 10011,
    CLIENT_BLOCKED = 10012,
    CLIENT_AUTO_AUTH_DISABLED = 10013,
    CLIENT_IDENTIFICATION_MISSING = 10014,
    CLIENT_TOKEN_EXPIRED = 10015,
    INVALID_USER_TOKEN = 10016,
    RESOURCE_NOT_FOUND = 10017,
    INVALID_PARAM_VALUE = 10018,
    DB_DUPLICATE_ENTRY = 10019,  
}

function errorCodeMessage(errorCode: number,messageDetail:string): string {
    let msg: string = undefined;
    switch (errorCode) {
        case ErrorCode.REQUIRED_PARAM_MISSING:
            msg = "Required parameter missing.";
            break;    
        case ErrorCode.DB_CONNECTION_FAIL:
            msg = "Database connection failed.";
            break;
        case ErrorCode.DB_QUERY_EXECUTION_ERROR:
            msg = "Database query execution failed.";
            break;
        case ErrorCode.DB_DATA_PARSE_ERROR:
            msg = "Error while parsing data.";
            break;  
        case ErrorCode.USER_NOT_FOUND:
            msg = "User not found.";
            break; 
        case ErrorCode.USER_NOT_AUTHENTICATED:
            msg = "Authentication failed.";
            break;
        case ErrorCode.USER_NOT_AUTHORIZED:
            msg = "User not authorized.";
            break;
        case ErrorCode.USER_IDENTIFICATION_MISSING:
            msg = "Missing User information.";
            break;
        case ErrorCode.USER_TOKEN_EXPIRED:
            msg = "User token expired.";
            break;
        case ErrorCode.CLIENT_NOT_FOUND:
            msg = "Client not found.";
            break;
        case ErrorCode.INVALID_CLIENT_KEY:
            msg = "Client key not valid.";
            break;
        case ErrorCode.CLIENT_BLOCKED:
            msg = "Client is blocked.";
            break;
        case ErrorCode.CLIENT_AUTO_AUTH_DISABLED:
            msg = "Client auto authorization is disbaled.";
            break;
        case ErrorCode.CLIENT_IDENTIFICATION_MISSING:
            msg = "Missing client information.";
            break;
        case ErrorCode.CLIENT_TOKEN_EXPIRED:
            msg = "Client token expired.";
            break;
        case ErrorCode.INVALID_USER_TOKEN:
            msg = "Invalid user token.";
            break;
        case ErrorCode.RESOURCE_NOT_FOUND:
            msg = "Resource not found.";
            break;
        case ErrorCode.INVALID_PARAM_VALUE:
            msg = "Invalid parameter(s).";
            break;
        case ErrorCode.DB_DUPLICATE_ENTRY:
            msg = "Duplicate entry.";
            break;       
        default:
            msg = errorCode.toString();
            break;
    }
    return msg + (messageDetail != null ? messageDetail : "");
}

export class CustomError extends Error {
    statusCode: number;
    errorCode: number;
    constructor(name, statusCode, errorCode, message: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = name || 'CustomError';       
        this.statusCode = statusCode || 400;
        this.errorCode = errorCode || 400;
        this.message = errorCodeMessage(errorCode, message);
    }
};

export class Forbidden extends Error {
    public statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.statusCode = 403;
        this.errorCode = errorCode || 403;
        this.message = errorCodeMessage(errorCode, message);
    }
};

export class DBError extends Error {

    public statusCode: number;
    public errorCode: number;
    public message: string;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor); //is it making any difference?
        this.name = this.constructor.name;
        this.statusCode = 500;
        this.errorCode = errorCode || 500;
        this.message = errorCodeMessage(errorCode, message);
    }
};

export class BadRequest extends Error {
    statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = 'BadRequest';
        this.statusCode = 400;
        this.errorCode = errorCode || 400;
        this.message = errorCodeMessage(errorCode, message);
    }
};

export class Unauthorized extends Error {
    statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
       Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.statusCode = 401;
        this.errorCode = errorCode || 401;
        this.message = errorCodeMessage(errorCode, message);
    }
};

export class NotFound extends Error {
    statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.statusCode = 404;
        this.errorCode = errorCode || 404;
        this.message = errorCodeMessage(errorCode, message);
    }
};

export class InternalServerError extends Error {
    statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.statusCode = 500;
        this.errorCode = errorCode || 500;
        this.message = errorCodeMessage(errorCode, message);
    }
};

export class RequestTimeout extends Error {
    statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.statusCode = 408;
        this.errorCode = errorCode || 408;
        this.message = errorCodeMessage(errorCode, message);
    }
};

export class UnprocessableEntity extends Error {
    statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.statusCode = 422;
        this.errorCode = errorCode || 422;
        this.message = errorCodeMessage(errorCode, message);
    }
};