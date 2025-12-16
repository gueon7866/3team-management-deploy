// room/controller.js
import * as roomService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

//
// Owner(사업자) 컨트롤러
//

// GET /api/room/owner/hotel/:hotelId
export const getRoomsByHotel = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res
        .status(403)
        .json(errorResponse("NO_PERMISSION", 403));
    }

    const rooms = await roomService.getRoomsByHotel(
      req.user.id || req.user._id,
      req.params.hotelId
    );

    return res.status(200).json(successResponse(rooms, "ROOM_LIST", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// POST /api/room/owner/:hotelId
export const createRoom = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res
        .status(403)
        .json(errorResponse("NO_PERMISSION", 403));
    }

    const room = await roomService.createRoom(
      req.user.id || req.user._id,
      req.params.hotelId,
      req.body
    );

    return res
      .status(201)
      .json(successResponse(room, "ROOM_CREATED", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// PATCH /api/room/owner/:roomId
export const updateRoom = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res
        .status(403)
        .json(errorResponse("NO_PERMISSION", 403));
    }

    const room = await roomService.updateRoom(
      req.user.id || req.user._id,
      req.params.roomId,
      req.body
    );

    return res.status(200).json(successResponse(room, "ROOM_UPDATED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// DELETE /api/room/owner/:roomId
export const deleteRoom = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res
        .status(403)
        .json(errorResponse("NO_PERMISSION", 403));
    }

    await roomService.deleteRoom(req.user.id || req.user._id, req.params.roomId);

    return res
      .status(200)
      .json(successResponse(null, "ROOM_DELETED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};
