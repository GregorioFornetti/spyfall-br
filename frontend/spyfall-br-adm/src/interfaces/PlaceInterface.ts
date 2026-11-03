import LocalizedName from './LocalizedName'

export default interface PlaceInterface {
    id: number,
    name: LocalizedName,
    rolesIds: number[],
    categoriesIds: number[],
    imgPath?: string
}