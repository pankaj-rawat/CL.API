import express = require('express');
import {APIResponse} from "../APIResponse";
import {AuthRepository} from "../repositories/AuthRepository";
import * as model from "../models/AuthModel";
import {Logger}  from "../Logger";

let authController = express.Router();

/**
 * @apiDefine ClientNotFoundError
 * @apiErrorExample {JSON} Client not found
 *     HTTP/1.1 200 OK
 *      {
 *             "error": {
 *             "errorCode": 10010,
 *             "statusCode": 401,
 *             "message": "Client not found."
 *             },
 *             "isValid": false
 *      }
 */

/**
 * @apiDefine DBConnectionFail 
 * @apiErrorExample {JSON} Database connection failed
 *     HTTP/1.1 200 OK
 *      {
 *             "error": {
 *             "errorCode": 10002,
 *             "statusCode": 500,
 *             "message": "Db connection failed."
 *              },
 *              "isValid": false
 *      }
 */

/**
 * @apiDefine ParamMissing 
 * @apiErrorExample {JSON} Parameter missing
 *     HTTP/1.1 200 OK
 *       {
 *         "error": {
 *           "errorCode": 10001,
 *           "statusCode": 400,
 *           "message": "Required parameter missing.Missing  client key."
 *         },
 *         "isValid": false
 *       }
 */

/**
 * @apiDefine InvalidKey 
 * @apiErrorExample {JSON} Invalid client key
 *     HTTP/1.1 200 OK
 *        {
 *           "error": {
 *           "errorCode": 10011,
 *           "statusCode": 401,
 *           "message": "Client key not valid."
 *           },
 *           "isValid": false
 *       }
 */

/**
 * @apiDefine APIResponse
 * @apiSuccess (Response)  {Object} [data] data returned by the specific method calls. It may not be avaiable only in case of an error.
 * @apiSuccess (Response) {String} data.expires token expiring datetime.
 * @apiSuccess (Response) {String} data.token token to use in further communications.
 * @apiSuccess (Response) {Bool} isValid result status.
 * @apiSuccess (Response) {String} [message] Message if any.
 * @apiSuccess (Response) {Object} [error] Error.
 * @apiSuccess (Response) {Number} [error.errorCode] API error code.
 * @apiSuccess (Response) {Number} [error.statusCode] representing equivalent Http status code.
 * @apiSuccess (Response) {String} [error.message] Error message for audit purpose.
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "data": {
 *           "expires": "2017-04-06T19:59:47.254Z",
 *           "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGllbnQiX0.LVDGN2KLC7sg1BPdac9TEQnTznNVdLImhSrf8qbDfNI"
 *           },
 *          "isValid": true
 *      }
 */

/**
 * @apiDefine none public access
 * Publically available to connect with api.
 */

/**
* @api {post} /auth/connect Connect
* @apiName Connect
* @apiGroup Authorization
* @apiExample Example usage:
*     header:
*     {
*           "content-type":"application/x-www-form-urlencoded"
*     }
*     body:
*     {
*       "clientName":"webApp",
*       "clientKey":"123456789"
*     }
* @apiPermission  none
* @apiParam {String} clientName Name of the client.
* @apiParam {String} clientKey Public key shared with client.
* @apiDescription Used to acquire token which is required for further communication with CL API.
* Note: header content-type should be set to "application/x-www-form-urlencoded"
* @apiUse APIResponse
* @apiUse ClientNotFoundError
* @apiUse DBConnectionFail
* @apiUse ParamMissing
* @apiUse InvalidKey
*/
authController.post('/connect', function (req, res, next) {
    Logger.log.info('connection in process: ' + req);
    let clRes: APIResponse;
    let authrepo = new AuthRepository();
    let idNotAvailable: number = 0;
    let clientName = req.body.clientName;
    let clientKey = req.body.clientKey;
    let response: Promise<model.AuthModel> = authrepo.connect(idNotAvailable, clientName, clientKey);
    response.then(function (result: model.AuthModel) {
        clRes = { data: result, isValid: true };
        res.send(clRes);
    });
    response.catch(function (err) {
        next(err);
    });
});

module.exports = authController;