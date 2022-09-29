import { Router } from "express";
import { getAllRoles, getRoleById, updateRole, createRole, deleteRole } from "../controllers/RoleController.js";

const router = Router()
const rolePath = 'roles'

router.get(`/${rolePath}`, getAllRoles)
      .get(`/${rolePath}/:id`, getRoleById)
      .post(`/${rolePath}`, createRole)
      .put(`/${rolePath}/:id`, updateRole)
      .delete(`/${rolePath}/:id`, deleteRole)

export default router