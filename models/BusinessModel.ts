export interface BusinessModel {
    id: number,
    idUser?:number,
    name: string,
    contactName?: string,
    idStatus: number,
    streetAddress: string,
    idCity: number,
    city: string,
    idState: number,
    state: string,
    postalCode: number,
    countryCode: string,
    wenURL?: string,
    latitude: number,
    longitude: number,
    geo?: string,
    createdOn: Date,
    lastUpdateOn: Date,
    description?: string,
    commenceDate?: Date,
    businessImages?: Array<BusinessImageModel>,
    businessOperationHours: Array<BusinessOperationHourModel>
    categories: Array<CategoryModel>
    contactNumbers: Array<BusinessPhoneModel>;
}

export interface BusinessPhoneModel {
    Phone: number,
    type: string,
    extension:number
}

export interface CategoryModel {
    id: number,
    Value: string
    tags:Array<TagModel>
}

export interface TagModel {
    id: number,
    value:string
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