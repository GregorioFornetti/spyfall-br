import { Router } from "express";
import { getAllCategories, getCategoryById, deleteCategory, createCategory, updateCategory } from "../controllers/CategoryController.js";

const router = Router()
const categoryPath = 'categories'

router.get(`/${categoryPath}`, getAllCategories)
      .get(`/${categoryPath}/:id`, getCategoryById)
      .post(`/${categoryPath}`, createCategory)
      .put(`/${categoryPath}/:id`, updateCategory)
      .delete(`/${categoryPath}/:id`, deleteCategory)

export default router