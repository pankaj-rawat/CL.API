import * as model from "../models/UserModel";

export interface IUserRepository {
    login(username: string, userLocation: string): Promise<model.UserModel>;
    find(id: number): Promise<model.UserModel>;  
    create(user:model.UserModel): Promise<model.UserModel>;
    update(user: model.UserModel):Promise<model.UserModel>;
    remove(id: number): Promise<number>;
    getUserRoles(id: number): Promise<Array<number>>;
}