import { getCategories } from '../models/getters.js'
import { getCollection, updateCollection, removePlaceReferences, nextId, assertUniqueName, findById, normalizeName } from '../models/store.js'

export async function getAllCategories(req, res) {
    try {
        return res.status(200).json(await getCategories())
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function getCategoryById(req, res) {
    try {
        const category = findById(await getCollection('categories'), Number(req.params.id))
        return res.status(200).json({
            id: Number(category.id),
            name: category.name
        })
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function createCategory(req, res) {
    try {
        const name = normalizeName(req.body.name)
        if (!name) {
            return res.status(400).json({'error': 'O nome não pode ser vazio'})
        }

        const newCategory = await updateCollection('categories', (categories) => {
            assertUniqueName(categories, name)
            const category = { id: nextId(categories), name }
            categories.push(category)
            return category
        })
        return res.status(200).json({
            id: Number(newCategory.id),
            name: newCategory.name
        })
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function updateCategory(req, res) {
    try {
        const name = normalizeName(req.body.name)
        if (!name) {
            return res.status(400).json({'error': 'O nome não pode ser vazio'})
        }

        const id = Number(req.params.id)
        const updatedCategory = await updateCollection('categories', (categories) => {
            const category = findById(categories, id)
            assertUniqueName(categories, name, id)
            category.name = name
            return category
        })
        return res.status(200).json({
            id: Number(updatedCategory.id),
            name: updatedCategory.name
        })
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function deleteCategory(req, res) {
    try {
        const id = Number(req.params.id)
        await updateCollection('categories', (categories) => {
            const index = categories.findIndex((category) => category.id === id)
            if (index !== -1) {
                categories.splice(index, 1)
            }
        })
        await removePlaceReferences('categoriesIds', id)
        return res.status(200).json({message: `Category with id ${req.params.id} deleted`})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}
