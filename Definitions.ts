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
    BussinessOwner = 3,
    RegisteredUser = 4
}

export enum Action {
    Read = 1,
    Modify = 2,
    Add = 4,
    Delete=8
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