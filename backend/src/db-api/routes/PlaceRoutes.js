import { Router } from "express";
import { getAllPlaces, getPlaceById, updatePlace, createPlace, deletePlace, getPlaceImage, deletePlaceImage } from "../controllers/PlaceController.js";
import placeImgUpload from "../middlewares/upload.js"

const router = Router()
const placePath = 'places'

router.get(`/${placePath}`, getAllPlaces)
      .get(`/${placePath}/:id`, getPlaceById)
      .post(`/${placePath}`, placeImgUpload, createPlace)
      .put(`/${placePath}/:id`, placeImgUpload, updatePlace)
      .delete(`/${placePath}/:id`, deletePlace)
      .get('/placeImgs/:filename', getPlaceImage)
      .delete(`/placeImgs/:id`, deletePlaceImage)

export default router