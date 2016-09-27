import model = require("./CategoryTagModel");
export interface BusinessModel {
    id: number,
    idUser?:number,
    name: string,
    contactName?: string,
    contactTitle?:string,
    idStatus: number,
    streetAddress: string,
    postalCode: number,
    idCity: number,
    city: string,
    idState: number,
    state: string,
    idCountry: number,
    country:string,
    webURL?: string,
    latitude?: number,
    longitude?: number,
    geo?: string,
    createdOn: Date,
    lastUpdateOn: Date,
    description?: string,
    commenceDate?: Date,
    businessImages?: Array<BusinessImageModel>,
    businessOperationHours?: Array<BusinessOperationHourModel>
    categories?: Array<model.CategoryModel>
    contactNumbers: Array<BusinessPhoneModel>;
}

export interface BusinessPhoneModel {
    idBusiness:number,
    phone: number,
    type: string,
    extension?:number
}

export interface BusinessImageModel {
    id?: number,
    name: string,
    uploadedOn: Date,
    idBusinessId: number,
    isProfileImage:boolean
}

export interface BusinessOperationHourModel {
    id?: number,
    idBusiness:number,
    day: number,
    timeOpen: string,
    timeClose: string
}

export interface BusinessOfferModel {
    id?: number,
    offer: string,
    detail: string,
    idBusiness: number,
    createdOn: Date,
    lastUpdatedOn: Date,
    expiryDate: Date,
    termsCondition?: string   
}