import irepo = require("../interfaces/ICategoryTagRepository");
import model = require("../models/CategoryTagModel");

export class CategoryRepository implements irepo.ICategoryRepository {
    find(id: number): Promise<model.CategoryModel> {
        return new Promise(function (resolve, reject) {

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