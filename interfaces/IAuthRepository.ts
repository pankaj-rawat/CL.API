import model = require("../models/AuthModel");

export interface IAuthRepository {
    authenticateUser(email: string, password: string, userLocation:string): Promise<model.AuthModel>;
    connect(clientId: number, clientName: string, clientKey: string): Promise<model.AuthModel>;
    refreshAccessToken(userid: number): model.AuthModel;
}