import irepo = require("../interfaces/ICategoryTagRepository");
import model = require("../models/CategoryTagModel");
import * as DB from "../DB";
import {Logger} from "../Logger";
import {ErrorCode} from "../ErrorCode";

export class CategoryRepository implements irepo.ICategoryRepository {
    find(id: number): Promise<model.CategoryModel> {
        return new Promise(function (resolve, reject) {
            if (id != null) {
                let category: model.CategoryModel;
                try {
                    DB.get().getConnection(function (err, connection) {
                        if (err) {
                            Logger.log.error(err.message);
                            reject(ErrorCode.DB_CONNECTION_FAIL);
                        }
                        else {
                            let query = connection.query('SELECT * FROM category WHERE id=?', id);
                            query.on('error', function (err) {
                                Logger.log.error(err.message);
                                reject(ErrorCode.DB_QUERY_EXECUTION_ERROR);
                            });
                            query.on('result', function (row, index: number) {
                                category = {
                                    id: row.id,
                                    value: row.value,
                                    active: row.active
                                };
                            });
                            query.on('end', function () {
                                if (category != null) {
                                    let tagRepo = new TagRepository();
                                    tagRepo.getTagsByCategory(category.id)
                                        .then(function (result: Array<model.TagModel>) {
                                            category.tags = result;
                                            resolve(category);
                                        })
                                        .catch(function (err) {
                                            Logger.log.error(err.message);
                                            reject(err);
                                        });
                                }
                                else {
                                    reject(new Error("category not found."));
                                }
                                connection.release();
                            });
                        }
                    });
                }
                catch (err) {
                    reject(err);
                }
            }
            else {
                Logger.log.error("Category id not supplied");
                reject(ErrorCode.PARAMETER_MISSING);
            }
        });
    }

    getAll(): Promise<Array<model.CategoryModel>> {
        return new Promise(function (resolve, reject) {
            let categories: Array<model.CategoryModel> = new Array<model.CategoryModel>();
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    Logger.log.error(err.message);
                    reject(ErrorCode.DB_CONNECTION_FAIL);
                }
                else {
                    let query = connection.query('SELECT * FROM category');
                    query.on('error', function (err) {
                        Logger.log.error(err.message);
                        reject(ErrorCode.DB_QUERY_EXECUTION_ERROR);
                    });
                    query.on('result', function (row, index: number) {
                        let category:model.CategoryModel={
                            id: row.Id,
                            value: row.value,
                            active: row.active
                        };
                        categories.push(category);
                    });
                    query.on('end', function () {
                        resolve(categories);
                        connection.release();
                    });
                }
            });
        });
    }
}

export class TagRepository implements irepo.ITagRepository {
    find(id: number): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
            if (id != null) {
                let tag: model.TagModel;
                DB.get().getConnection(function (err, connection) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        let query = connection.query('select * from tag where id=?', id);
                        query.on('error', function (err) {
                            reject(err);
                        });
                        query.on('result', function (row) {
                            tag = {
                                active:row.active,
                                id:row.id,
                                idCategory:row.IdCategory,
                                value:row.value
                            };
                        });
                        query.on('end', function () {
                            resolve(tag);
                            connection.release();
                        })
                    }
                });
            }
            else {
                reject(ErrorCode.PARAMETER_MISSING);
            }
        });
    }
    getTagsByCategory(categoryId: number): Promise<Array<model.TagModel>> {
        return new Promise(function (resolve, reject) {
            if (categoryId != null) {
                let tags: Array<model.TagModel> = new Array<model.TagModel>();
                DB.get().getConnection(function (err, connection) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        let query = connection.query('select * from tag where idCategory=?', categoryId);
                        query.on('error', function (err) {
                            reject(err);
                        });
                        query.on('result', function (row) {
                            let tag:model.TagModel = {
                                active: row.active,
                                id: row.id,
                                idCategory: row.IdCategory,
                                value: row.value
                            };
                            tags.push(tag);
                        });
                        query.on('end', function () {
                            resolve(tags);
                            connection.release();
                        })
                    }
                });
            }
            else {
                reject(ErrorCode.PARAMETER_MISSING);
            }

        });
    }
    create(tag: model.TagModel): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
            if (tag != null) {
                DB.get().getConnection(function (err, connection) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        //let post = {
                        //    value: tag.value,
                        //    idcategory: tag.idCategory,
                        //    active:tag.active
                        //}
                        let query = connection.query('INSERT INTO tag SET value=?, idcategory=?,active=?',[tag.value,tag.idCategory,tag.active], function (err, result) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                tag.id = result.insertId;
                                resolve(tag);
                            }
                        });                        
                    }
                });
            }
            else {
                reject(ErrorCode.PARAMETER_MISSING);
            }
        });
    }
    update(tag: model.TagModel): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
            if (tag != null) {
            }
            else {
                reject(ErrorCode.PARAMETER_MISSING);
            }
        });
    }
    remove(id: number): Promise<number> {
        return new Promise(function (resolve, reject) {
            if (id != null) {
            }
            else {
                reject(ErrorCode.PARAMETER_MISSING);
            }
        });
    }
}