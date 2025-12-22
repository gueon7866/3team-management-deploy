// room/controller.js
import * as roomService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

const normalizeArrayField = (value) => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return [];
    // JSON 배열로 온 경우
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {
        // fallthrough
      }
    }
    // comma-separated
    if (trimmed.includes(",")) return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    return [trimmed];
  }
  return [value];
};

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
      req.params.hotelId,
      req.user.role
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

    const uploadedImages = req.files?.map((f) => f.location) || [];

    const body = { ...req.body };
    const imagesFromBody = normalizeArrayField(body.images);
    if (uploadedImages.length > 0) {
      body.images = imagesFromBody ? [...imagesFromBody, ...uploadedImages] : uploadedImages;
    } else if (imagesFromBody) {
      body.images = imagesFromBody;
    }
    const amenitiesFromBody = normalizeArrayField(body.amenities);
    if (amenitiesFromBody) body.amenities = amenitiesFromBody;

    const room = await roomService.createRoom(
      req.user.id || req.user._id,
      req.params.hotelId,
      body
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

    const uploadedImages = req.files?.map((f) => f.location) || [];
    const body = { ...req.body };
    const imagesFromBody = normalizeArrayField(body.images);
    if (uploadedImages.length > 0) {
      body.images = imagesFromBody ? [...imagesFromBody, ...uploadedImages] : uploadedImages;
    } else if (imagesFromBody) {
      body.images = imagesFromBody;
    }
    const amenitiesFromBody = normalizeArrayField(body.amenities);
    if (amenitiesFromBody) body.amenities = amenitiesFromBody;

    const room = await roomService.updateRoom(
      req.user.id || req.user._id,
      req.params.roomId,
      body
    );

    return res.status(200).json(successResponse(room, "ROOM_UPDATED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// POST /api/room/owner/:roomId/images
export const uploadRoomImages = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res.status(403).json(errorResponse("NO_PERMISSION", 403));
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(errorResponse("NO_IMAGES_UPLOADED", 400));
    }

    const imageUrls = req.files.map((file) => file.location);
    const room = await roomService.addRoomImages(
      req.user.id || req.user._id,
      req.params.roomId,
      imageUrls
    );

    return res
      .status(200)
      .json(successResponse(room, "ROOM_IMAGE_UPLOADED", 200));
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
