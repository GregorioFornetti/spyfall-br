import express, { Router } from "express";
import { login, logout, getAuthPage } from "../controllers/AuthenticationController.js";

const router = Router()

router.all(`/auth`, getAuthPage)
      .post(`/login`, express.urlencoded({ extended: false }), login)
      .get(`/logout`, logout)

export default router