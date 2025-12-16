import * as authService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(200).json(successResponse(result, "LOGIN_SUCCESS"));
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(successResponse(result, "REGISTER_SUCCESS"));
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    // req.user is populated by verifyToken middleware
    const user = req.user;
    return res.status(200).json(successResponse(user, "USER_INFO_SUCCESS"));
  } catch (err) {
    next(err);
  }
};