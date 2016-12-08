import model = require("../models/RegistrationPlanModel");
import {RepoResponse} from "../RepoResponse";
export interface IRegistrationPlanRepository {
    find(id: number): Promise<model.RegistrationPlanModel>;
    getAll(offset: number, limit: number, includeInactive?: boolean): Promise<RepoResponse>;
}