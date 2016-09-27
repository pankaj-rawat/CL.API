import * as model from "../models/CityStateCountryModel";

export interface ICityRepository {
    find(id: number): Promise<model.CityModel>;
    getCitiesByState(stateId: number): Promise<Array<model.CityModel>>;
}
export interface IStateRepository {
    find(id: number): Promise<model.StateModel>;
    getStatesByCountry(countryId: number): Promise<Array<model.StateModel>>;    
}
export interface ICountryRepository {
    find(id: number): Promise<model.CountryModel>;
    getAll(): Promise<Array<model.CountryModel>>;
}