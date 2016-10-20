﻿import * as model from "../models/CityStateCountryModel";
import {RepoResponse} from "../RepoResponse";

export interface ICityRepository {
    find(id: number): Promise<model.CityModel>;
    getCitiesByState(stateId: number): Promise<Array<model.CityModel>>;
}
export interface IStateRepository {
    find(id: number): Promise<RepoResponse>;
    getAll(offset: number, limit: number, idCountry: number): Promise<RepoResponse>; 
}
export interface ICountryRepository {
    find(id: number): Promise<model.CountryModel>;
    getAll(): Promise<Array<model.CountryModel>>;
}