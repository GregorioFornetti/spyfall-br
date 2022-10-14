

export default function place2JSON(place) {
    const placeJSON = {}
    if (place.imgPath) {
        placeJSON.imgPath = place.imgPath
    }
    placeJSON.id = Number(place.id)
    placeJSON.name = place.name
    placeJSON.rolesIds = place.Roles.map((role) => Number(role.id))
    placeJSON.categoriesIds = place.Categories.map((category) => Number(category.id))

    return placeJSON
}