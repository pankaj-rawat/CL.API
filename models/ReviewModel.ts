export interface ReviewModel {
    id?: number
    , idBusiness: number
    , rating: number
    , comment: string
    , idUser?: number
    , idStatus?: number
    , idReviewParent?: number
    , createDate?: Date
    , updateBy?: number
    , updateDate?: Date
}