import { Router } from "express";
import { getAllPlaces, getPlaceById, updatePlace, createPlace, deletePlace } from "../controllers/PlaceController.js";

const router = Router()
const placePath = 'places'

router.get(`/${placePath}`, getAllPlaces)
      .get(`/${placePath}/:id`, getPlaceById)
      .post(`/${placePath}`, createPlace)
      .put(`/${placePath}/:id`, updatePlace)
      .delete(`/${placePath}/:id`, deletePlace)

export default router