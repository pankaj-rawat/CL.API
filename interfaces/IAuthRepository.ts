import model = require("../models/AuthModel");

export interface IAuthRepository {
    //login(userName: string, password: string, userLocation: string): Promise<model.AuthModel>;
    connect(clientId: number, clientName: string, clientKey: string): Promise<model.AuthModel>;
    refreshAccessToken(userid: number): string;
    //validateUser(userId: number, res: (res:Array<number>) => void): void; //left intentionaly with callback
}