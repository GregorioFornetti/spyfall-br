import Category from "../interfaces/CategoryInterface";
import Role from "../interfaces/RoleInterface";
import Place from "../interfaces/PlaceInterface";
import LocalizedName from "../interfaces/LocalizedName";


// Nome exibido na administração (em português). Aceita string por
// robustez contra dados antigos ainda em memória.
export function displayName(name: LocalizedName | string): string {
    if (typeof name === 'string') {
        return name
    }
    return name?.pt ?? name?.en ?? ''
}

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
    return {value: category.id, label: displayName(category.name)}
}

export function role2RoleOption(role: Role) {
    return {value: role.id, label: displayName(role.name)}
}


export function createEmptyRole(): Role {
    return {id: -1, name: {pt: '', en: ''}}
}

export function createEmptyPlace(): Place {
    return {id: -1, name: {pt: '', en: ''}, categoriesIds: [], rolesIds: []}
}

export function createEmptyCategory(): Category {
    return {id: -1, name: {pt: '', en: ''}}
}
