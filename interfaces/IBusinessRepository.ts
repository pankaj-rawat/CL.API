import model = require("../models/BusinessModel");
export interface IBusinessRepository {
    save(business: model.BusinessModel): Promise<model.BusinessModel>;
    get(id: number): Promise<model.BusinessModel>;
    unRegister(id: number): Promise<number>; 
    addOffer(offer: model.BusinessOfferModel): Promise<model.BusinessOfferModel>;
    updateOffer(offer: model.BusinessOfferModel): Promise<model.BusinessOfferModel>;
    deactivateOffer(id:number):Promise<boolean>;
}

