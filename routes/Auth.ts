import express = require('express');
import {APIResponse} from "../APIResponse";
import {AuthRepository} from "../repositories/AuthRepository";
import * as model from "../models/AuthModel";
import {Logger}  from "../Logger";

let authController = express.Router();

/**
 * @apiDefine ClientNotFoundError
 * @apiError CLIENT_NOT_FOUND The client was not found.
 * @apiErrorExample {JSON} CLIENT_NOT_FOUND-Response:
 *     HTTP/1.1 200 OK
 *      {
 *             "error": {
 *             "errorCode": 10010,
 *             "statusCode": 401,
 *             "message": "Client not found."
 *      },
 *      "isValid": false
 *      }
 */

/**
 * @apiDefine DBConnectionFail
 * @apiError DB_CONNECTION_FAIL Database connection failed. 
 * @apiErrorExample {JSON} DB_CONNECTION_FAIL-response
 *     HTTP/1.1 200 OK
 *      {
 *             "error": {
 *             "errorCode": 10002,
 *             "statusCode": 500,
 *             "message": "Db connection failed."
 *      },
 *      "isValid": false
 *      }
 */

/**
 * @apiDefine Response
 * @apiSuccess (response)  {Object} [data] API response.
 * @apiSuccess (response) {String} data.expires token expiring datetime.
 * @apiSuccess (response) {String} data.token token to use in further communications.
 * @apiSuccess (response) {Bool} isValid result status.
 * @apiSuccess (response) {String} [message] Message if any.
 * @apiSuccess (response) {Object} [error] Error.
 * @apiSuccess (response) {Number} [error.errorCode] API error code.
 * @apiSuccess (response) {Number} [error.statusCode] representing equivalent Http status code.
 * @apiSuccess (response) {String} [error.message] Error message for audit purpose.
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
* @api {post} /auth/connect Return client's token.
* @apiHeader {String} content-type="application/x-www-form-urlencoded" application/x-www-form-urlencoded
* @apiHeaderExample {json} Header-Example:
*     {
*       "Content-Type":"application/x-www-form-urlencoded"
*     }
* @apiExample Example usage:
*     endpoint: https://cl-api-s.herokuapp.com/api/auth/connect
*
*     body:
*     {
*       "clientName":"webApp1",
*       "clientKey":"123456789"
*     }
*
* @apiSampleRequest https://cl-api-s.herokuapp.com/api/auth/connect
* @apiParam {String} clientName="webapp"
* @apiParam {String} clientKey="123456789"
* @apiUse ClientNotFoundError
* @apiUse Response
* @apiUse DBConnectionFail
* @apiUse DBConnectionFail 
* @apiGroup Authorization
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