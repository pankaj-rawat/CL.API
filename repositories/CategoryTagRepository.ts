import irepo = require("../interfaces/ICategoryTagRepository");
import model = require("../models/CategoryTagModel");
import * as DB from "../DB";
import {Logger} from "../Logger";
import * as CLError from '../CLError';
import {RepoResponse} from "../RepoResponse";


export class CategoryRepository implements irepo.ICategoryRepository {
    get(id: number): Promise<model.CategoryModel> {
        return new Promise<model.CategoryModel>(function (resolve, reject) {
            if (id == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'Category id not supplied.'));
            }
            getCategory(0, 1, id, true)
                .then(function (result: RepoResponse) {
                    resolve(result.data[0]);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    }

    getAll(offset: number, limit: number, includeInActive?: boolean): Promise<RepoResponse> {
        return getCategory(offset, limit, null, includeInActive);
    }
}

export class TagRepository implements irepo.ITagRepository {
    get(id: number): Promise<model.TagModel> {
        return new Promise<model.TagModel>(function (resolve, reject) {
            if (id == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING, 'Tag id not supplied.'));
            }
            getTag(0, 1, id,null,true)
                .then(function (result: RepoResponse) {
                    resolve(result.data[0]);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    }
    getAll(offset: number, limit: number, idCategory?: number, includeInactive?: boolean): Promise<RepoResponse> {
        return getTag(offset, limit, null, idCategory, includeInactive);
    }
    create(tag: model.TagModel): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
            if (tag == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING));
            }
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                //let post = {
                //    value: tag.value,
                //    idcategory: tag.idCategory,
                //    active:tag.active
                //}
                let query = connection.query('INSERT INTO tag SET value=?, idcategory=?,active=?', [tag.value, tag.idCategory, tag.active], function (err, result) {
                    if (err) {
                        connection.release();
                        reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, " Error occured while saving tag." + err.message));
                    }
                    else {
                        connection.release();
                        tag.id = result.insertId;
                        resolve(tag);
                    }
                });
            });
        });
    }
    update(tag: model.TagModel): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
            if (tag != null) {
            }
            else {
                reject(CLError.ErrorCode.REQUIRED_PARAM_MISSING);
            }
        });
    }
    remove(id: number): Promise<number> {
        return new Promise<number>(function (resolve, reject) {
            if (id != null) {
            }
            else {
                reject(CLError.ErrorCode.REQUIRED_PARAM_MISSING);
            }
        });
    }
}

function getCategory(offset: number, limit: number, id?: number, includeInactive?: boolean): Promise<RepoResponse> {
    return new Promise<RepoResponse>(function (resolve, reject) {
        let categories: Array<model.CategoryModel> = new Array<model.CategoryModel>();
        DB.get().getConnection(function (err, connection) {
            if (err != null) {
                let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                clError.stack = err.stack;
                return reject(clError);
            }

            let encounteredError: boolean = false;
            let recCount: number = 0;
            let query = connection.query('SET @rCount=0; CAll sp_select_category(@rCount,?,?,?,?); select @rCount rcount;', [offset, limit, id, includeInactive]);
            query.on('error', function (err) {
                encounteredError = true;
                return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting categories. ' + err.message));
            });
            query.on('result', function (row, index) {
                try {
                    if (index == 1) {
                        let category: model.CategoryModel = {
                            id: row.id,
                            value: row.value,
                            active: row.active
                        };
                        categories.push(category);
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
            query.on('end', function () {
                connection.release();
                if (!encounteredError) {
                    if (categories.length > 0) {
                        let res: RepoResponse = {
                            data: categories
                            , recordCount: recCount
                        };
                        resolve(res);
                    }
                    else {
                        reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, 'Category not found.'));
                    }
                }
            });

        });
    });
}

function getTag(offset: number, limit: number, id?: number, idCategory?: number, includeInactive?: boolean): Promise<RepoResponse> {
    return new Promise<RepoResponse>(function (resolve, reject) {
        let tags: Array<model.TagModel> = new Array<model.TagModel>();
        DB.get().getConnection(function (err, connection) {
            if (err != null) {
                let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                clError.stack = err.stack;
                return reject(clError);
            }

            let encounteredError: boolean = false;
            let recCount: number = 0;
            let query = connection.query('SET @rCount=0; CAll sp_select_tag(@rCount,?,?,?,?,?); select @rCount rcount;', [offset, limit, id, idCategory, includeInactive]);
            query.on('error', function (err) {
                encounteredError = true;
                return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting tag. ' + err.message));
            });
            query.on('result', function (row, index) {
                try {
                    if (index == 1) {
                        let tag: model.TagModel = {
                            id: row.id,
                            value: row.value,
                            active: row.active,
                            idCategory: row.idCategory
                        };
                        tags.push(tag);
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
            query.on('end', function () {
                connection.release();
                if (!encounteredError) {
                    if (tags.length > 0) {
                        let res: RepoResponse = {
                            data: tags
                            , recordCount: recCount
                        };
                        resolve(res);
                    }
                    else {
                        reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, 'Tag not found.'));
                    }
                }
            });

        });
    });
}