export enum Status {
    Active = 1,
    InActive = 2,
    Verified = 3,
    VerificationPending = 4,
    ReportedDataIncorrect = 5,
    Blocked = 6
}
export enum Role { 
    Guest = 1,
    Admin = 2,    
    RegisteredUser = 3
}

export enum Action {
    Get_Any = 1,
    Get_Owned = 2,
    Put_Any = 4,
    Put_Owned = 8,
    Post_Any = 16,
    Post_Owned = 32,
    Delete_Any = 64,
    Delete_Owned= 128
}

export enum WeekDay {
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sunday=7
}
export enum UserOnlineStatus {
    OFFLINE = 0
    , ONLINE = 1
    ,ONLINE_AT_DIFFERENT_LOCATION=2
}