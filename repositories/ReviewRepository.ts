import irepo = require("../interfaces/IReviewRepository");
import {RepoResponse } from "../RepoResponse";
import model = require("../models/ReviewModel");
import * as DB from "../DB";
import {Logger as logger} from "../Logger";
import * as CLError from '../CLError';
import config = require('config');

export class ReviewRepository implements irepo.IReviewRepository {

    save(review: model.ReviewModel, requestBy: number): Promise<model.ReviewModel> {
        return new Promise<model.ReviewModel>(function (resolve, reject) {
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_upsert_business_review(?,?,?,?,?,?,?)',
                    [review.id, review.rating, review.idBusiness, review.idReviewParent, review.comment, review.idStatus, requestBy]);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while saving review. ' + err.message);
                    clError.stack = err.stack;
                    return reject(clError);
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        review.id = row.id;
                        review.createDate = row.createDate;
                        review.updateDate = row.updateDate;
                        review.idStatus = row.idStatus;
                        review.updateBy = row.updateBy;
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (review.id != null) {
                            resolve(review);
                        }
                        else {
                            return reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "Business for Id " + review.id + " not found."));
                        }
                    }
                });
            });
        });
    }
    updateStatus(id: number, idStatus, requestBy: number): Promise<boolean> {
        return new Promise<boolean>(function (resolve, reject) {
            let newIdStatus: number;
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('Call sp_upsert_business_review(?,?,?,?,?,?,?)',
                    [id, null, null, null, null, idStatus, requestBy]);
                query.on('error', function (err) {
                    encounteredError = true;
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while updating review status. ' + err.message);
                    clError.stack = err.stack;
                    return reject(clError);
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        newIdStatus = row.idStatus;
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (newIdStatus == idStatus) {
                            resolve(true);
                        }
                        else {
                            return reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "Business for Id " + id + " not found."));
                        }
                    }
                });
            });
        });
    }   
    get(id: number, requestBy: number): Promise<model.ReviewModel> {
        return new Promise<model.ReviewModel>(function (resolve, reject) {
            getReview(0, 1, requestBy, id, null, null, null)
                .then(function (result) {
                    return result.data[0];
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    }
    getAll(offset: number, limit: number, requestBy: number, idUser?: number, idBusiness?: number, idStatus?: number): Promise<RepoResponse> {
        return getReview(offset, limit, requestBy, null, idUser, idBusiness, idStatus);
    }
}

function getReview(offset: number, limit: number, requestBy: number, id?: number, idUser?: number, idBusiness?: number, idStatus?: number): Promise<RepoResponse> {
    return new Promise<RepoResponse>(function (resolve, reject) {
        let reviews: Array<model.ReviewModel> = new Array<model.ReviewModel>();
        DB.get().getConnection(function (err, connection) {
            if (err) {
                return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
            }

            let encounteredError: boolean = false;
            let recCount: number = 0;
            let query = connection.query('SET @rCount=0; CAll sp_select_business_review(@rCount,?,?,?,?,?,?,?); select @rCount rcount;',
                [offset, limit, id, idUser, idBusiness, requestBy, idStatus]);
            query.on('error', function (err) {
                encounteredError = true;
                return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while reading reviews." + err.message));
            });
            query.on('result', function (row, index) {
                if (index == 1) {
                    reviews.push({
                        id: row.id
                        , idBusiness: row.idBusiness
                        , rating: row.rating
                        , comment: row.comment
                        , idUser: row.idUser
                        , idStatus: row.idStatus
                        , idReviewParent: row.idReviewParent
                        , createDate: row.createDate
                        , updateBy: row.updateBy
                        , updateDate: row.updateDate
                    });
                }
                else if (index == 3) {
                    recCount = row.rcount;
                }
            });
            query.on('end', function () {
                connection.release();
                if (!encounteredError) {
                    if (reviews.length > 0) {
                        let res: RepoResponse = {
                            data: reviews
                            , recordCount: recCount
                        };
                        resolve(res);
                    }
                    else {
                        reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "No record found."));
                    }
                }
            });
        });
    });
};