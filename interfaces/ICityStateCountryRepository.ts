import {RepoResponse} from "../RepoResponse";

export interface ICityRepository {
    find(id: number): Promise<RepoResponse>;
    getAll(offset: number, limit: number, idState: number): Promise<RepoResponse>; 
}
export interface IStateRepository {
    find(id: number): Promise<RepoResponse>;
    getAll(offset: number, limit: number, idCountry: number): Promise<RepoResponse>; 
}
export interface ICountryRepository {
    find(id: number): Promise<RepoResponse>;
    getAll(offset: number, limit: number): Promise<RepoResponse>;
}