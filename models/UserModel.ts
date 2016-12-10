export interface UserModel{
    id?:number;
    email: string;
    password?: string;
    phoneLandLine?: number;
    extension?: number;
    phoneCell?: number;   
    idStatus?: number;
    idCity: number;
    createdOn?: Date;
    updatedOn?: Date;
    subscriptionOptIn: boolean;
    subscriptionOptInDate?: Date;
    subscriptionOptOutDate?: Date;
}