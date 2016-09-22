import * as model from "../models/CityStateCountryModel";

export interface ICountryRepository {
    find(id: number): Promise<model.CountryModel>;
    getAll(): Promise<Array<model.CountryModel>>;
}

export interface ICityRepository {
    find(id: number):Promise<model.CityModel>;
    getAll(): Promise<Array<model.CityModel>>;
}
export interface IStateRepository {
    find(id: number): Promise<model.StateModel>;
    getAll(): Promise<Array<model.StateModel>>;
    }