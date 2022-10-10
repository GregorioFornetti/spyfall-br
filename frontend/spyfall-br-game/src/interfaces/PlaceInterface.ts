
export default interface PlaceInterface {
    id: number,
    name: string,
    rolesIds: number[],
    categoriesIds: number[],
    imgPath?: string
}