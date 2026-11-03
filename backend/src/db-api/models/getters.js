import { getCollection, findById } from "./store.js"

// Sem cache em memória: o servidor do jogo e o de administração rodam em
// processos separados, então os arquivos JSON são lidos do disco a cada
// chamada para um servidor sempre enxergar as alterações feitas pelo outro.
export async function getCategories() {
    const categories = await getCollection('categories')
    return categories.map((category) => ({
        id: Number(category.id),
        name: category.name
    }))
}

export async function getRoles() {
    const roles = await getCollection('roles')
    return roles.map((role) => ({
        id: Number(role.id),
        name: role.name,
        ...(role.hint ? { hint: role.hint } : {})
    }))
}

export async function getPlaces() {
    return getCollection('places')
}

export async function getPlaceRoles(placeID) {
    const places = await getCollection('places')
    const place = findById(places, Number(placeID))
    return place.rolesIds
}
