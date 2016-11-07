import irepo = require("../interfaces/ICategoryTagRepository");
import model = require("../models/CategoryTagModel");
import * as DB from "../DB";
import {Logger} from "../Logger";
import * as CLError from '../CLError';

export class CategoryRepository implements irepo.ICategoryRepository {
    find(id: number): Promise<model.CategoryModel> {
        return new Promise(function (resolve, reject) {
            if (id == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING));
            }

            let category: model.CategoryModel;
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('SELECT * FROM category WHERE id=?', id);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while getting category." + err.message));
                });
                query.on('result', function (row, index: number) {
                    if (index == 0) {
                        category = {
                            id: row.id,
                            value: row.value,
                            active: row.active
                        };
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (category != null) {
                            let tagRepo = new TagRepository();
                            tagRepo.getTagsByCategory(category.id)
                                .then(function (result: Array<model.TagModel>) {
                                    category.tags = result;
                                    resolve(category);
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
                        }
                        else {
                            reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "Category not found for id " + id));
                        }
                    }
                });
            });
        });
    }

    getAll(): Promise<Array<model.CategoryModel>> {
        return new Promise<Array<model.CategoryModel>>(function (resolve, reject) {
            let categories: Array<model.CategoryModel> = new Array<model.CategoryModel>();
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('SELECT * FROM category');
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while reading categories. " + err.message));
                });
                query.on('result', function (row, index: number) {
                    if (index == 0) {
                        let category: model.CategoryModel = {
                            id: row.id,
                            value: row.value,
                            active: row.active
                        };
                        categories.push(category);
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (categories.length > 0) {
                            resolve(categories);
                        }
                        else {
                            reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, 'No catgory found.'));
                        }
                    }
                });
            });
        });
    }
}

export class TagRepository implements irepo.ITagRepository {
    find(id: number): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
            if (id == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING));
            }
            let tag: model.TagModel;
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let query = connection.query('select * from tag where id=?', id);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while reading tag. " + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        tag = {
                            active: row.active,
                            id: row.id,
                            idCategory: row.IdCategory,
                            value: row.value
                        };
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (tag) {
                            resolve(tag);
                        }
                        else {
                            reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "Tag not found for id " + id));
                        }
                    }
                })
            });
        });
    }
    getTagsByCategory(categoryId: number): Promise<Array<model.TagModel>> {
        return new Promise<Array<model.TagModel>>(function (resolve, reject) {
            if (categoryId == null) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.REQUIRED_PARAM_MISSING));
            }
            let tags: Array<model.TagModel> = new Array<model.TagModel>();
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }

                let encounteredError: boolean = false;
                let query = connection.query('select * from tag where idCategory=?', categoryId);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, " Error occured while reading tags. " + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 0) {
                        let tag: model.TagModel = {
                            active: row.active,
                            id: row.id,
                            idCategory: row.IdCategory,
                            value: row.value
                        };
                        tags.push(tag);
                    }
                });
                query.on('end', function () {
                    connection.release();
                    if (!encounteredError) {
                        if (tags.length > 0) {
                            resolve(tags);
                        }
                        else {
                            reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "Tags not founds."));
                        }
                    }
                })
            });

        });
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