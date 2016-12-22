import model = require("../models/ReviewModel");
import {RepoResponse} from "../RepoResponse";
export interface IReviewRepository {    
    save(review: model.ReviewModel, requestBy: number): Promise<model.ReviewModel>;
    updateStatus(id: number, idStatus, requestBy: number): Promise<boolean>;
    get(id: number, requestBy: number): Promise<model.ReviewModel>;
    getAll(offset: number, limit: number, requestBy: number, idUser?: number, idBusiness?: number, idStatus?: number): Promise<RepoResponse>;
}
