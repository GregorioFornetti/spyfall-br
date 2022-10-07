import { Router } from "express";
import { getAllRoles, getRoleById, updateRole, createRole, deleteRole } from "../controllers/RoleController.js";
import checkAuthentication from '../middlewares/auth.js'

const router = Router()
const rolePath = 'roles'

router.get(`/${rolePath}`, getAllRoles)
      .get(`/${rolePath}/:id`, getRoleById)
      .post(`/${rolePath}`, checkAuthentication, createRole)
      .put(`/${rolePath}/:id`, checkAuthentication, updateRole)
      .delete(`/${rolePath}/:id`, checkAuthentication, deleteRole)

export default router