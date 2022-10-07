import { Router } from "express";
import { getAllCategories, getCategoryById, deleteCategory, createCategory, updateCategory } from "../controllers/CategoryController.js";
import checkAuthentication from '../middlewares/auth.js'

const router = Router()
const categoryPath = 'categories'

router.get(`/${categoryPath}`, getAllCategories)
      .get(`/${categoryPath}/:id`, getCategoryById)
      .post(`/${categoryPath}`, checkAuthentication, createCategory)
      .put(`/${categoryPath}/:id`, checkAuthentication, updateCategory)
      .delete(`/${categoryPath}/:id`, checkAuthentication, deleteCategory)

export default router