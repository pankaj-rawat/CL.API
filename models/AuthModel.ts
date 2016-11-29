export interface AuthModel {
    token: string,
    expires: Date,
    userRoleIds?:Array<number>
}

export interface RoleAccess {
    idRole: number,
    idResource:number,
    resource: string,
    actionMask:number
}