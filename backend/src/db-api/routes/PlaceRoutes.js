import { Router } from "express";
import { getAllPlaces, getPlaceById, updatePlace, createPlace, deletePlace, getPlaceImage, deletePlaceImage } from "../controllers/PlaceController.js";
import placeImgUpload from "../middlewares/upload.js"
import checkAuthentication from '../middlewares/auth.js'

const router = Router()
const placePath = 'places'

router.get(`/${placePath}`, getAllPlaces)
      .get(`/${placePath}/:id`, getPlaceById)
      .post(`/${placePath}`, checkAuthentication, placeImgUpload, createPlace)
      .put(`/${placePath}/:id`, checkAuthentication, placeImgUpload, updatePlace)
      .delete(`/${placePath}/:id`, checkAuthentication, deletePlace)
      .get('/placeImgs/:filename', getPlaceImage)
      .delete(`/placeImgs/:id`, checkAuthentication, deletePlaceImage)

export default router