import Category from "../interfaces/CategoryInterface";
import Role from "../interfaces/RoleInterface";
import Place from "../interfaces/PlaceInterface";


export function getPlaceById(id: number, places: Place[]): Place {
    return places.find((place) => place.id === id) as Place
}

export function getRoleById(id: number, roles: Role[]): Role {
    return roles.find((role) => role.id === id) as Role
}

export function getCategoryById(id: number, categories: Category[]): Category {
    return categories.find((category) => category.id === id) as Category
}


export function category2CategoryOption(category: Category) {
    return {value: category.id, label: category.name}
}

export function role2RoleOption(role: Role) {
    return {value: role.id, label: role.name}
}