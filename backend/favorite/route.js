// favorite/route.js
import { Router } from "express";
import {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
} from "./controller.js";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";


const router = Router();

router.get("/me", verifyToken, getMyFavorites);
router.post("/", verifyToken, addFavorite);
router.delete("/", verifyToken, removeFavorite);
router.post("/toggle", verifyToken, toggleFavorite);

export default router;
