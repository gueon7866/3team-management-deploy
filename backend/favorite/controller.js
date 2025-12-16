// favorite/controller.js
import * as favoriteService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

// GET /api/favorite/me
export const getMyFavorites = async (req, res) => {
  try {
    const data = await favoriteService.getMyFavorites(req.user.id);
    return res
      .status(200)
      .json(successResponse(data, "FAVORITE_LIST", 200));
  } catch (err) {
    return res.status(400).json(errorResponse(err.message, 400));
  }
};

// POST /api/favorite
export const addFavorite = async (req, res) => {
  try {
    const { hotelId } = req.body;
    const fav = await favoriteService.addFavorite(req.user.id, hotelId);
    return res.status(201).json(successResponse(fav, "FAVORITE_ADDED", 201));
  } catch (err) {
    return res.status(400).json(errorResponse(err.message, 400));
  }
};

// DELETE /api/favorite
export const removeFavorite = async (req, res) => {
  try {
    const { hotelId } = req.body;
    await favoriteService.removeFavorite(req.user.id, hotelId);
    return res
      .status(200)
      .json(successResponse(null, "FAVORITE_REMOVED", 200));
  } catch (err) {
    return res.status(400).json(errorResponse(err.message, 400));
  }
};

// POST /api/favorite/toggle
export const toggleFavorite = async (req, res) => {
  try {
    const { hotelId } = req.body;
    const result = await favoriteService.toggleFavorite(req.user.id, hotelId);
    return res
      .status(200)
      .json(successResponse(result, "FAVORITE_TOGGLED", 200));
  } catch (err) {
    return res.status(400).json(errorResponse(err.message, 400));
  }
};
