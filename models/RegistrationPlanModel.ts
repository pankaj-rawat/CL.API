export interface RegistrationPlanModel {
    id: number,
    name: string,
    active: boolean,
    detail: string,
    price: number,
    createDate: Date,
    updateDate: Date,
    features?: Array<RegistrationPlanFeatureModel>
}

export interface RegistrationPlanFeatureModel {
    id:number,
    idRegistrationPlan:number,
    feature:string,
    active:boolean,
    createDate:Date,
    updateDate:Date
}

