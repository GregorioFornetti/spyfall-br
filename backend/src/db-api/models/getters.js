import Category from "./Category.js"
import Place from './Place.js'
import Role from "./Role.js"
import place2JSON from "./place2JSON.js"

var categories
var roles
var places

export async function getCategories() {
    if (!categories) {
        categories = await Category.findAll({
            attributes: ['id', 'name']
        })
        categories = categories.map((category) => ({
            id: Number(category.id),
            name: category.name
        }))
    }
    return categories
}

export async function getRoles() {
    if (!roles) {
        roles = await Role.findAll({
            attributes: ['id', 'name']
        })
        roles = roles.map((role) => ({
            id: Number(role.id),
            name: role.name
        }))
    }
    return roles
}

export async function getPlaces() {
    if (!places) {
        places = await Place.findAll({
            include: [
                {
                    model: Role
                },
                {
                    model: Category
                }
            ]
        })
        places = places.map(place2JSON)
    }
    console.log(places)
    return places
}


export function resetCategories() {
    categories = null
}

export function resetRoles() {
    roles = null
}

export function resetPlaces() {
    places = null
}