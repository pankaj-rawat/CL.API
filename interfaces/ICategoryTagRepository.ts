import model = require("../models/CategoryTagModel");
import {RepoResponse} from "../RepoResponse";
export interface ICategoryRepository{
    get(id: number): Promise<model.CategoryModel>;
    getAll(offset: number, limit: number, includeInActive ?: boolean): Promise<RepoResponse> ;
}

export interface ITagRepository {
    get(id: number): Promise<model.TagModel>;
    getAll(offset: number, limit: number,idCategory?:number, includeInactive?: boolean): Promise<RepoResponse>;
    create(tag: model.TagModel): Promise<model.TagModel>;
    update(tag: model.TagModel): Promise<model.TagModel>;
    remove(id:number): Promise<number>;
}

