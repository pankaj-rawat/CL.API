import model = require("../models/BusinessModel");
import {RepoResponse} from "../RepoResponse";
export interface IBusinessRepository {
    save(business: model.BusinessModel,requestedBy:number): Promise<model.BusinessModel>;
    get(id: number): Promise<model.BusinessModel>;
    unRegister(id: number): Promise<number>;    
    searchByLatLong(offset: number, limit: number, searchText: string, latitude: Number, longitude: Number): Promise<RepoResponse>;
    searchByCity(offset: number, limit: number, searchText: string, idCity: number): Promise<RepoResponse>;
    myBusinessRequest(idBusiness: number, idUser: number, location: string): Promise<number>;
    assignUser(idBusiness: number, idUser: number, code: string, location: string): Promise<number>;
    saveOffer(offer: model.BusinessOfferModel, requestBy: number): Promise<model.BusinessOfferModel>;
    getOffer(id: number,idBusiness:number): Promise<model.BusinessOfferModel>;
    getAllOffer(offset: number, limit: number, idBusiness?: number): Promise<RepoResponse>;
}

