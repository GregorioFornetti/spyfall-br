import Role from '../models/Role.js'

export async function getAllRoles(req, res) {
    try {
        const roles = await Role.findAll({
            attributes: ['id', 'name']
        })
        return res.status(200).json(roles.map((role) => ({
            id: Number(role.id),
            name: role.name
        })))
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function getRoleById(req, res) {
    try {
        const role = await Role.findOne({
            where: {
                id: Number(req.params.id)
            },
            attributes: ['id', 'name']
        })
        return res.status(200).json({
            id: Number(role.id),
            name: role.name
        })
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function createRole(req, res) {
    try {
        console.log(req.body)
        const newRole = await Role.create(req.body)
        return res.status(200).json({
            id: Number(newRole.id), 
            name: newRole.name
        })
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function updateRole(req, res) {
    try {
        await Role.update(req.body, {
            where: {
                id: Number(req.params.id)
            }
        })
        const updatedRole = await Role.findOne({
            where: {
                id: Number(req.params.id)
            },
            attributes: ['id', 'name']
        })
        return res.status(200).json({
            id: Number(updatedRole.id),
            name: updatedRole.name
        })
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function deleteRole(req, res) {
    try {
        await Role.destroy({
            where: {
                id: Number(req.params.id)
            }
        })
        return res.status(200).json({message: `Role with id ${req.params.id} deleted`})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}