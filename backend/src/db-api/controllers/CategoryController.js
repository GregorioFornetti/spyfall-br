import Category from '../models/Category.js'

export async function getAllCategories(req, res) {
    try {
        const categories = await Category.findAll({
            attributes: ['id', 'name']
        })
        return res.status(200).json(categories)
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function getCategoryById(req, res) {
    try {
        const category = await Category.findOne({
            where: {
                id: Number(req.params.id)
            },
            attributes: ['id', 'name']
        })
        return res.status(200).json(category)
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function createCategory(req, res) {
    try {
        const newCategory = await Category.create(req.body)
        return res.status(200).json({id: newCategory.id, name: newCategory.name})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function updateCategory(req, res) {
    try {
        await Category.update(req.body, {
            where: {
                id: Number(req.params.id)
            }
        })
        const updateCategory = await Category.findOne({
            where: {
                id: Number(req.params.id)
            },
            attributes: ['id', 'name']
        })
        return res.status(200).json(updateCategory)
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function deleteCategory(req, res) {
    try {
        await Category.destroy({
            where: {
                id: Number(req.params.id)
            }
        })
        return res.status(200).json({message: `Category with id ${req.params.id} deleted`})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}