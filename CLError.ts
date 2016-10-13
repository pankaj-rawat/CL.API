import express = require('express');

export class CLError extends Error {

    statusCode: number;
    errorCode: number;

       BadRequest(message, errorCode) {
        Error.captureStackTrace(this, this.constructor);
        this.name = 'BadRequest';
        this.message = message || 'Bad Request';
        this.statusCode = 400;
        this.errorCode = errorCode || 400;
    };

   
    InternalServerError(message, errorCode) {

        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message || 'Internal Server Error';
        this.statusCode = 500;
        this.errorCode = errorCode || 500;
    };

    RequestTimeout(message, errorCode) {

        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message || 'Request Timeout';
        this.statusCode = 408;
        this.errorCode = errorCode || 408;
    };

    Unauthorized(message, errorCode) {

        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message || 'Unauthorized Request';
        this.statusCode = 401;
        this.errorCode = errorCode || 401;
    };

    UnprocessableEntity(message, errorCode) {
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message || 'Unprocessable Entity';
        this.statusCode = 422;
        this.errorCode = errorCode || 422;
    };

    NotFound(message, errorCode) {
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message || 'The requested resource couldn\'t be found';
        this.statusCode = 404;
        this.errorCode = errorCode || 404;
    };   
};

export class CustomError extends Error {
    statusCode: number;
    errorCode: number;
    constructor(name, statusCode, errorCode, message?:string)
    {
        super(message);  
        Error.captureStackTrace(this, this.constructor);   
        this.name = name || 'CustomError';
        this.message = message || 'Custom error without message';
        this.statusCode = statusCode || 400;
        this.errorCode = errorCode || 400;
    }  
};

export class Forbidden extends Error {
    public statusCode: number;
    errorCode: number;
    constructor(errorCode?:number,message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message || 'Forbidden';
        this.statusCode = 403;
        this.errorCode = errorCode || 403;
    }
};

export class DBError extends Error {
     statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message || 'DBError';
        this.statusCode = 500;
        this.errorCode = errorCode || 500;
    }
};

export class BadRequest extends Error {
    statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = 'BadRequest';
        this.message = message || 'Bad Request';
        this.statusCode = 400;
        this.errorCode = errorCode || 400;
    }
};

export class Unauthorized extends Error {
    statusCode: number;
    errorCode: number;
    constructor(errorCode?: number, message?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message || 'Unauthorized Request';
        this.statusCode = 401;
        this.errorCode = errorCode || 401;
    }
};