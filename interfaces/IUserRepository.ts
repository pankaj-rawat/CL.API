import * as model from "../models/UserModel";
import {RepoResponse} from "../RepoResponse";

export interface IUserRepository {
    login(email: string, userLocation: string): Promise<model.UserModel>;
    get(id: number, requestedBy: number): Promise<model.UserModel>;  
    create(user:model.UserModel): Promise<model.UserModel>;
    update(user: model.UserModel, requestedBy: number):Promise<model.UserModel>;
    remove(id: number, requestedBy: number): Promise<number>;
    getAll(offset: number, limit: number, requestedBy: number, idUser: number): Promise<RepoResponse>; 
    forgetPassword(email: string, location: string, resetURL: string): Promise<boolean>;
    updatePassword(idUser: number, location: string, newPwd: string, requestedBy?: number,fpToken?:string): Promise<boolean>;
}