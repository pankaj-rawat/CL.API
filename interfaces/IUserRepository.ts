import * as model from "../models/UserModel";
import {RepoResponse} from "../RepoResponse";

export interface IUserRepository {
    login(email: string, userLocation: string): Promise<model.UserModel>;
    find(id: number): Promise<model.UserModel>;  
    create(user:model.UserModel): Promise<model.UserModel>;
    update(user: model.UserModel):Promise<model.UserModel>;
    remove(id: number): Promise<number>;
    getAll(offset: number, limit: number, idUser: number): Promise<RepoResponse>; 
}