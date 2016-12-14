import model = require("./CategoryTagModel");
export interface BusinessModel {
    id?: number,
    idUser?: number,
    name: string,
    contactName?: string,
    contactTitle?: string,
    idStatus?: number,
    streetAddress: string,
    postalCode: number,
    idCity: number,
    city?: string,
    idState: number,
    state?: string,
    idCountry: number,
    country?: string,
    webURL?: string,
    latitude?: number,
    longitude?: number,
    geo?: string,    
    description?: string,
    commenceDate?: Date,
    idRegistrationPlan: number,
    registrationPlanOptDate?: Date,
    registrationPlanExpireDate?: Date,
    registrationPlanName?:string,
    images?: Array<BusinessImageModel>,
    operationHours?: Array<BusinessOperationHourModel>,
    idCategory:number,
    tags?: Array<model.TagModel>,
    contactNumbers?: Array<BusinessPhoneModel>,
    offers?:Array<BusinessOfferModel>,
    createdBy?: number,
    createDate?: Date,    
    updatedBy?: number,
    updateDate?: Date
}

export interface BusinessSearchResultModel {
    id: number,    
    name: string,    
    idStatus: number,
    status:string,
    streetAddress: string,
    postalCode: number,
    idCity: number,
    city: string,
    idState: number,
    state: string,
    webURL?: string,
    latitude?: number,
    longitude?: number,
    geo?: string,    
    profileImgURL?: string,
    idOffer?: number,
    offer?: string,
    rating: Number,
    idCategory: number,
    category: string,    
    idUser?: number,
}

export interface BusinessPhoneModel {
    idBusiness?: number,
    phone: number,
    type: string,
    extension?: number
}

export interface BusinessImageModel {
    id?: number,
    idBusinessId?: number,
    imageURL: string,
    isProfileImage: boolean,
    uploadDate?: Date,
}

export interface BusinessOperationHourModel {
    idBusiness: number,
    day: number,
    timeOpen: string,
    timeClose: string
}

export interface BusinessOfferModel {
    id?: number,
    offer: string,
    idStatus:number,
    detail: string,
    idBusiness: number,
    createDate: Date,
    updateDate: Date,
    expiryDate: Date,
    termsCondition?: string
}