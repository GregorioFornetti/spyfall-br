import Place from '../models/Place.js'
import Category from '../models/Category.js'
import Role from '../models/Role.js'
import Place_Category from '../models/Place_Category.js'
import Place_Role from '../models/Place_Role.js'
import { placeImgsPath } from '../configs/paths.js'
import fs from 'fs'

function place2JSON(place) {
    const placeJSON = {}
    if (place.imgPath) {
        placeJSON.imgPath = place.imgPath
    }
    placeJSON.id = place.id
    placeJSON.name = place.name
    placeJSON.rolesIds = place.Roles.map((role) => Number(role.id))
    placeJSON.categoriesIds = place.Categories.map((category) => Number(category.id))

    return placeJSON
}


export async function getAllPlaces(req, res) {
    try {
        const places = await Place.findAll({
            include: [
                {
                    model: Role
                },
                {
                    model: Category
                }
            ]
        })
        return res.status(200).json(places.map(place2JSON))
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function getPlaceById(req, res) {
    try {
        const place = await Place.findOne({
            where: {
                id: Number(req.params.id)
            },
            include: [
                {
                    model: Role
                },
                {
                    model: Category
                }
            ]
        })
        return res.status(200).json(place2JSON(place))
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function createPlace(req, res) {
    try {
        const {name, rolesIds, categoriesIds} = req.body

        const newPlaceJson = {name: name}
        if (req.body.imgPath) {
            newPlaceJson.imgPath = req.body.imgPath
        }
        const newPlace = await Place.create(newPlaceJson)

        await Place_Role.bulkCreate(
            JSON.parse(rolesIds).map((roleId) => ({roleId: roleId, placeId: newPlace.id}))
        )
        await Place_Category.bulkCreate(
            JSON.parse(categoriesIds).map((categoryId) => ({categoryId: categoryId, placeId: newPlace.id}))
        )

        return res.status(200).json({
            id: newPlace.id,
            name: newPlace.name
        })
    } catch(error) {
        if (req.body && req.body.imgPath) {
            if (fs.existsSync(req.body.imgPath)) {
                fs.rmSync(req.body.imgPath)
            }
        }
        return res.status(500).json(error.message)
    }
}

export async function updatePlace(req, res) {
    try {
        const id = Number(req.params.id)
        const {name, rolesIds, categoriesIds} = req.body

        const oldPlace = await Place.findOne({
            where: {
                id: id
            }
        })

        await Place.update({
            name: name,
            imgPath: (req.body.imgPath) ? (req.body.imgPath) : (null)
        }, {
            where: {
                id: id
            }
        })

        await Place_Category.destroy({
            where: {
                placeId: id
            }
        })
        await Place_Role.destroy({
            where: {
                placeId: id
            }
        })

        if (rolesIds) {
            await Place_Role.bulkCreate(
                JSON.parse(rolesIds).map((roleId) => ({roleId: roleId, placeId: id}))
            )
        }
        if (categoriesIds) {
            await Place_Category.bulkCreate(
                JSON.parse(categoriesIds).map((categoryId) => ({categoryId: categoryId, placeId: id}))
            )
        }

        if (oldPlace.imgPath) {
            if (fs.existsSync(oldPlace.imgPath)) {
                fs.rmSync(oldPlace.imgPath)
            }
        }

        return res.status(200).json({
            id: id,
            name: name
        })
    } catch(error) {
        if (req.body && req.body.imgPath) {
            if (fs.existsSync(req.body.imgPath)) {
                fs.rmSync(req.body.imgPath)
            }
        }
        return res.status(500).json(error.message)
    }
}

export async function deletePlace(req, res) {
    try {
        const deletedPlace = await Place.findOne({
            where: {
                id: req.params.id
            }
        })
        await Place.destroy({
            where: {
                id: req.params.id
            }
        })

        if (deletedPlace.imgPath) {
            if (fs.existsSync(deletedPlace.imgPath)) {
                fs.rmSync(deletedPlace.imgPath)
            }
        }
        
        return res.status(200).json({'message': `Place with id ${req.params.id} deleted`})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function getPlaceImage(req, res) {
    res.sendFile(`${placeImgsPath}/${req.params.filename}`, {root: '.'})
}