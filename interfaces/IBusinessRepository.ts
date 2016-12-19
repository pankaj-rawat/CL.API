import model = require("../models/BusinessModel");
export interface IBusinessRepository {
    save(business: model.BusinessModel,requestedBy:number): Promise<model.BusinessModel>;
    get(id: number): Promise<model.BusinessModel>;
    unRegister(id: number): Promise<number>; 
    saveOffer(offer: model.BusinessOfferModel, requestBy:number): Promise<model.BusinessOfferModel>;
}

