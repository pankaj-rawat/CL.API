export interface CategoryModel {
    id?: number,
    value: string,
    tags?:Array<TagModel>,
    active?:boolean
}

export interface TagModel {
    id?: number,
    value: string,
    idCategory: number,
    active:boolean
}