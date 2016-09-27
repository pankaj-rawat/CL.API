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
                DB.get().getConnection(function (err, connection) {
                    if (err) {
                        Logger.log.error(err.message);
                        reject(ErrorCode.DB_CONNECTION_FAIL);
                    }
                    else {
                        let query = connection.query('Call ', id);
                        query.on('error', function (err) {
                            Logger.log.error(err.message);
                            reject(ErrorCode.DB_QUERY_EXECUTION_ERROR);
                        });
                        query.on('result', function (row, index: number) {
                            category = {
                                id: row.Id,
                                value: row.value,
                                active: row.active,
                                tags: undefined
                            };
                        });
                        query.on('end', function () {
                            if (category != null) {
                                if (category.id != null) {
                                    let tagRepo = new TagRepository();
                                    tagRepo.findByCategory(category.id)
                                        .then(function (result: Array<model.TagModel>) {
                                            category.tags = result;
                                        })
                                        .catch(function (err) {
                                            Logger.log.error(err.message);
                                        });
                                }
                            }
                        });
                    }

                });
            }
            else {
                Logger.log.error("Category id not supplied");
                reject(ErrorCode.PARAMETER_MISSING);
            }
        });
    }

    getAll(): Promise<Array<model.CategoryModel>> {
        return new Promise(function (resolve, reject) {

        });
    }
}

export class TagRepository implements irepo.ITagRepository {
    find(id: number): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
        });
    }
    findByCategory(categoryId: number): Promise<Array<model.TagModel>> {
        return new Promise(function (resolve, reject) {

        });
    }
    getAll(): Promise<Array<model.TagModel>> {
        return new Promise(function (resolve, reject) {
        });
    }
    create(tag: model.TagModel): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
        });
    }
    update(tag: model.TagModel): Promise<model.TagModel> {
        return new Promise(function (resolve, reject) {
        });
    }
    remove(id: number): Promise<number> {
        return new Promise(function (resolve, reject) {
        });
    }
}