// hotel/controller.js
import * as hotelService from "./service.js";
import Hotel from "./model.js";
import { successResponse, errorResponse } from "../common/response.js";

const normalizeArrayField = (value) => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return [];

    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {}
    }

    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [value];
};

const normalizeNumberField = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

//
// OWNER
//

export const getMyHotels = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 10, 10);

    const data = await hotelService.getHotelsByOwner(ownerId, { page, limit });
    return res.status(200).json(successResponse(data, "MY_HOTELS", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const createHotel = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const uploadedImages = req.files?.map((f) => f.location) || [];
    const body = { ...req.body };

    const freebies = normalizeArrayField(body.freebies);
    const amenities = normalizeArrayField(body.amenities);
    const imagesFromBody = normalizeArrayField(body.images);

    if (freebies !== undefined) body.freebies = freebies;
    if (amenities !== undefined) body.amenities = amenities;

    if (uploadedImages.length > 0) {
      body.images = imagesFromBody
        ? [...imagesFromBody, ...uploadedImages]
        : uploadedImages;
    } else if (imagesFromBody) {
      body.images = imagesFromBody;
    }

    const rating = normalizeNumberField(body.rating);
    if (rating !== undefined) body.rating = rating;

    const hotel = await hotelService.createHotel(ownerId, body);

    return res
      .status(201)
      .json(successResponse(hotel, "HOTEL_CREATED_PENDING", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const updateHotel = async (req, res) => {
  try {
    // 관리자는 ownerId 체크를 건너뛰도록 null 전달
    const ownerId = req.user?.role === "admin" ? null : (req.user.id || req.user._id);
    const { hotelId } = req.params;

    const uploadedImages = req.files?.map((f) => f.location) || [];
    const body = { ...req.body };

    const freebies = normalizeArrayField(body.freebies);
    const amenities = normalizeArrayField(body.amenities);
    const imagesFromBody = normalizeArrayField(body.images);

    if (freebies !== undefined) body.freebies = freebies;
    if (amenities !== undefined) body.amenities = amenities;

    // 이미지 처리: FormData에서 전송된 기존 이미지 URL + 새로 업로드된 이미지
    if (uploadedImages.length > 0) {
      body.images = imagesFromBody
        ? [...imagesFromBody, ...uploadedImages]
        : uploadedImages;
    } else if (imagesFromBody !== undefined) {
      // 기존 이미지만 업데이트 (새 파일 없음)
      body.images = imagesFromBody;
    }

    const rating = normalizeNumberField(body.rating);
    if (rating !== undefined) body.rating = rating;

    const hotel = await hotelService.updateHotel(ownerId, hotelId, body);
    return res.status(200).json(successResponse(hotel, "HOTEL_UPDATED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

//
// ADMIN
//

export const getAllHotels = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const data = await hotelService.getAllHotels({ status, page, limit });
    return res.status(200).json(successResponse(data, "ALL_HOTELS", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const getPendingHotels = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const data = await hotelService.getPendingHotels({ page, limit });
    return res.status(200).json(successResponse(data, "PENDING_HOTELS", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const approveHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const hotel = await hotelService.approveHotel(hotelId);

    return res
      .status(200)
      .json(successResponse(hotel, "HOTEL_APPROVED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const rejectHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const hotel = await hotelService.rejectHotel(hotelId);

    return res
      .status(200)
      .json(successResponse(hotel, "HOTEL_REJECTED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// ✅ 프론트가 owner 화면에서도 /api/hotel/admin/:id 로 호출해서 404가 났던 부분 대응
export const getHotelById = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!hotelId) {
      return res.status(400).json(errorResponse("HOTEL_ID_REQUIRED", 400));
    }

    const ownerId =
      req.user?.role === "owner" ? (req.user.id || req.user._id) : null;

    const hotel = await hotelService.getHotelById(hotelId, ownerId);
    return res.status(200).json(successResponse(hotel, "HOTEL_DETAIL", 200));
  } catch (err) {
    console.error("getHotelById error:", err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// 호텔 이미지 업로드
export const uploadHotelImages = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json(errorResponse("HOTEL_NOT_FOUND", 404));
    }

    if (
      req.user?.role !== "admin" &&
      hotel.owner &&
      hotel.owner.toString() !== (req.user.id || req.user._id)?.toString()
    ) {
      return res.status(403).json(errorResponse("NO_PERMISSION", 403));
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json(errorResponse("NO_IMAGES_UPLOADED", 400));
    }

    const imageUrls = req.files.map((file) => file.location);
    hotel.images = [...(hotel.images || []), ...imageUrls];
    await hotel.save();

    return res
      .status(200)
      .json(successResponse(hotel, "HOTEL_IMAGE_UPLOADED", 200));
  } catch (err) {
    return res.status(400).json(errorResponse(err.message, 400));
  }
};
