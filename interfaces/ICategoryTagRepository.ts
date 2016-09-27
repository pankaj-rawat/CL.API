import model = require("../models/CategoryTagModel");
export interface ICategoryRepository{
    find(id: number): Promise<model.CategoryModel>;
    getAll(): Promise<Array<model.CategoryModel>>;
}

export interface ITagRepository {
    find(id: number): Promise<model.TagModel>;
    findByCategory(categoryId: number): Promise<Array<model.TagModel>>;
    getAll(): Promise<Array<model.TagModel>>;
    create(tag: model.TagModel): Promise<model.TagModel>;
    update(tag: model.TagModel): Promise<model.TagModel>;
    remove(id:number): Promise<number>;
}

