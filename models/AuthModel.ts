export interface AuthModel {
    token: string,
    expires: Date,
    userRoleId?:number
}

export interface RoleAccess {
    idRole: number,
    resource: string,
    actionMask:number
}