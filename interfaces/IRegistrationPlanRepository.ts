import model = require("../models/RegistrationPlanModel");
export interface IRegistrationPlanRepository {
    find(id: number): Promise<model.RegistrationPlanModel>;
    getAll(): Promise<model.RegistrationPlanModel>;
}