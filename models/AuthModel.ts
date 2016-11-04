export interface AuthModel {
    token: string,
    expires: Date,
    userRoleIds?:Array<number>
}

export interface RoleAccess {
    idRole: number,
    resource: string,
    actionMask:number
}