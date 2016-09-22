import model = require("../models/AuthModel");

export interface IAuthRepository {
    login(userName:string,password:string):Promise<model.AuthModel>;
    validateUser(userId: number, res: (res:Array<number>) => void): void; //left intentionaly with callback
}