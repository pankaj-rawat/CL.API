import model = require("../models/AuthModel");

export interface IAuthRepository {
    authenticateUser(email: string, password: string): Promise<model.AuthModel>;
    connect(clientId: number, clientName: string, clientKey: string): Promise<model.AuthModel>;
    refreshAccessToken(userid: number, location: string): Promise<model.AuthModel>;
}