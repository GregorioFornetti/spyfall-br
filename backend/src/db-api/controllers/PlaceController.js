import { placeImgsPath } from '../../configs/index.js'
import fs from 'fs'
import { getPlaces } from '../models/getters.js'
import { getCollection, updateCollection, nextId, assertUniqueName, findById, normalizeName } from '../models/store.js'


function parseIds(value) {
    if (value === undefined) {
        return undefined
    }
    const ids = (typeof value === 'string') ? JSON.parse(value) : value
    return ids.map(Number)
}

export async function getAllPlaces(req, res) {
    try {
        return res.status(200).json(await getPlaces())
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function getPlaceById(req, res) {
    try {
        const place = findById(await getCollection('places'), Number(req.params.id))
        return res.status(200).json(place)
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function createPlace(req, res) {
    try {
        const name = normalizeName(req.body.name)
        if (!name) {
            return res.status(400).json({'error': 'O nome não pode ser vazio'})
        }

        const newPlace = await updateCollection('places', (places) => {
            assertUniqueName(places, name)
            const place = {
                id: nextId(places),
                name
            }
            if (req.body.imgPath) {
                place.imgPath = req.body.imgPath
            }
            place.rolesIds = parseIds(req.body.rolesIds) ?? []
            place.categoriesIds = parseIds(req.body.categoriesIds) ?? []
            places.push(place)
            return place
        })
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
        const name = normalizeName(req.body.name)
        if (!name) {
            return res.status(400).json({'error': 'O nome não pode ser vazio'})
        }

        const id = Number(req.params.id)
        const oldPlace = findById(await getCollection('places'), id)

        await updateCollection('places', (places) => {
            const place = findById(places, id)
            assertUniqueName(places, name, id)
            place.name = name
            if (deleteImage) {
                delete place.imgPath
            } else if (req.body.imgPath) {
                place.imgPath = req.body.imgPath
            }
            const rolesIds = parseIds(req.body.rolesIds)
            if (rolesIds) {
                place.rolesIds = rolesIds
            }
            const categoriesIds = parseIds(req.body.categoriesIds)
            if (categoriesIds) {
                place.categoriesIds = categoriesIds
            }
        })

        if (req.body.deleteImg || (req.body.imgPath && req.body.imgPath !== oldPlace.imgPath)) {
            if (oldPlace.imgPath && fs.existsSync(oldPlace.imgPath)) {
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
        const id = Number(req.params.id)
        const deletedPlace = await updateCollection('places', (places) => {
            const index = places.findIndex((place) => place.id === id)
            if (index === -1) {
                return null
            }
            return places.splice(index, 1)[0]
        })

        if (deletedPlace && deletedPlace.imgPath) {
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
    try {
        return res.status(200).sendFile(`${placeImgsPath}/${req.params.filename}`, {root: '.'})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function deletePlaceImage(req, res) {
    try {
        const id = Number(req.params.id)
        const place = findById(await getCollection('places'), id)

        if (place.imgPath && fs.existsSync(place.imgPath)) {
            fs.rmSync(place.imgPath)
        }

        await updateCollection('places', (places) => {
            delete findById(places, id).imgPath
        })
        return res.status(200).json({message: 'Imagem removida com sucesso'})
    } catch(error) {
        return res.status(400).json(error)
    }
}
