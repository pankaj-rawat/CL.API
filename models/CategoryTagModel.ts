export interface CategoryModel {
    id?: number,
    value: string,
    active?: boolean,
    tags?:Array<TagModel>
}

export interface TagModel {
    id?: number,
    value: string,
    idCategory: number,
    active:boolean
}