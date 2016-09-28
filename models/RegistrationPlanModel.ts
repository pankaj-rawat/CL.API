export interface RegistrationPlanModel {
    id: number,
    name: string,
    active: boolean,
    detail: string,
    price: number,
    createdOn: Date,
    lastUpdatedOn: Date,
    features?: Array<RegistrationPlanFeatureModel>
}

export interface RegistrationPlanFeatureModel {
    id:number,
    idRegistrationPlan:number,
    feature:string,
    active:boolean,
    createdOn:Date,
    lastUpdatedOn:Date
}

