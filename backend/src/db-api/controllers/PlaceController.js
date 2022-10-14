import Place from '../models/Place.js'
import Category from '../models/Category.js'
import Role from '../models/Role.js'
import Place_Category from '../models/Place_Category.js'
import Place_Role from '../models/Place_Role.js'
import { placeImgsPath } from '../configs/index.js'
import fs, { existsSync } from 'fs'
import place2JSON from '../models/place2JSON.js'
import { getPlaces, resetPlaces } from '../models/getters.js'


export async function getAllPlaces(req, res) {
    try {
        return res.status(200).json(await getPlaces())
    } catch(error) {
        console.log('erro no place')
        console.log(res)
        console.log(req)
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
        if (req.body.name.length === 0) {
            return res.status(400).json({'error': 'O nome não pode ser vazio'})
        }

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
        
        resetPlaces()
        return res.status(200).json({
            id: Number(newPlace.id),
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
        var deleteImage = req.body.deleteImg !== undefined
        if (req.body.name.length === 0) {
            return res.status(400).json({'error': 'O nome não pode ser vazio'})
        }
        
        const id = Number(req.params.id)
        const {name, rolesIds, categoriesIds} = req.body

        const oldPlace = await Place.findOne({
            where: {
                id: id
            }
        })

        var newImgPath
        if (deleteImage) {
            newImgPath = null
        } else {
            newImgPath = (req.body.imgPath) ? (req.body.imgPath) : (oldPlace.imgPath)
        }

        await Place.update({
            name: name,
            imgPath: newImgPath
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
        
        if (req.body.deleteImg || (req.body.imgPath && req.body.imgPath !== oldPlace.imgPath)) {
            if (fs.existsSync(oldPlace.imgPath)) {
                fs.rmSync(oldPlace.imgPath)
            }
        }

        resetPlaces()
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
        
        resetPlaces()
        return res.status(200).json({'message': `Place with id ${req.params.id} deleted`})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function getPlaceImage(req, res) {
    try {
        return res.status(200).sendFile(`${placeImgsPath}/${req.params.filename}`, {root: '.'})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function deletePlaceImage(req, res) {
    try {
        const place = await Place.findOne({
            where: {
                id: req.params.id
            }
        })
        
        if (place.imgPath && fs.existsSync(place.imgPath)) {
            fs.rmSync(place.imgPath)
        }

        Place.update({
            imgPath: null
        }, {
            where: {
                id: req.params.id
            }
        })
        resetPlaces()
        return res.status(200).json({message: 'Imagem removida com sucesso'})
    } catch(error) {
        return res.status(400).json(error)
    }
}