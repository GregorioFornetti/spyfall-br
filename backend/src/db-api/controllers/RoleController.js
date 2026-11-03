import { getRoles } from '../models/getters.js'
import { getCollection, updateCollection, removePlaceReferences, nextId, assertUniqueName, findById, normalizeName } from '../models/store.js'

export async function getAllRoles(req, res) {
    try {
        return res.status(200).json(await getRoles())
    } catch(error) {
        return res.status(500).json(error.message)
    }
}

export async function getRoleById(req, res) {
    try {
        const role = findById(await getCollection('roles'), Number(req.params.id))
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
        const name = normalizeName(req.body.name)
        if (!name) {
            return res.status(400).json({'error': 'O nome não pode ser vazio'})
        }

        const newRole = await updateCollection('roles', (roles) => {
            assertUniqueName(roles, name)
            const role = { id: nextId(roles), name }
            roles.push(role)
            return role
        })
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
        const name = normalizeName(req.body.name)
        if (!name) {
            return res.status(400).json({'error': 'O nome não pode ser vazio'})
        }

        const id = Number(req.params.id)
        const updatedRole = await updateCollection('roles', (roles) => {
            const role = findById(roles, id)
            assertUniqueName(roles, name, id)
            role.name = name
            return role
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
        const id = Number(req.params.id)
        await updateCollection('roles', (roles) => {
            const index = roles.findIndex((role) => role.id === id)
            if (index !== -1) {
                roles.splice(index, 1)
            }
        })
        await removePlaceReferences('rolesIds', id)
        return res.status(200).json({message: `Role with id ${req.params.id} deleted`})
    } catch(error) {
        return res.status(500).json(error.message)
    }
}
