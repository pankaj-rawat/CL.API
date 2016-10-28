export interface AuthModel {
    token: string,
    expires: Date,
    user?: AuthUsermodel
}

export interface AuthUsermodel {
    id:number,
    userName: string
    //,roles: Array<number>
}