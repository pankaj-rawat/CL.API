import * as model from "../models/UserModel";

export interface IUserRepository {
    find(id: number): Promise<model.UserModel>;    
    getAllByCity(cityId: number): Promise<model.UserModel[]>;    
    getAllByState(stateId: number): Promise<model.UserModel[]>;    
    create(user:model.UserModel): Promise<model.UserModel>;
    update(user: model.UserModel):Promise<model.UserModel>;
    remove(id: number): Promise<number>;
    getUserRoles(id: number): Promise<Array<number>>;
}