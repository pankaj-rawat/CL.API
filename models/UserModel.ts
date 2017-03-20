export interface UserModel{
    id?:number;
    email: string;
    password?: string;
    phoneLandLine?: number;
    extension?: number;
    phoneCell?: number;   
    idStatus?: number;
    idCity: number;
    createDate?: Date;
    updateDate?: Date;
    subscriptionOptIn: boolean;
    subscriptionOptInDate?: Date;
    subscriptionOptOutDate?: Date;
}