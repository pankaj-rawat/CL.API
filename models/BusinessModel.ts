﻿import model = require("./CategoryTagModel");
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
    createdOn?: Date,
    updatedOn?: Date,
    description?: string,
    commenceDate?: Date,
    idRegistrationPlan: number,
    registrationPlanOptDate?: Date,
    registrationPlanExpiry?: Date,
    registrationPlanName?:string,
    images?: Array<BusinessImageModel>,
    operationHours?: Array<BusinessOperationHourModel>,
    idCategory:number,
    tags?: Array<model.TagModel>,
    contactNumbers?: Array<BusinessPhoneModel>,
    createdBy:number
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
    imgURL: string,
    uploadedOn?: Date,
    idBusinessId?: number,
    isProfileImage: boolean
}

export interface BusinessOperationHourModel {
    id?: number,
    idBusiness: number,
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
    updatedOn: Date,
    expiryDate: Date,
    termsCondition?: string
}