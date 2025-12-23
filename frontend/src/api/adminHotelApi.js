import axiosClient from "./axiosClient";
import hotelApi from "./hotelApi";
import roomApi from "./roomApi";

export const adminHotelApi = {
  // 관리자: 전체 호텔 목록 조회
  getAllHotels: async (params = {}) => {
    return await hotelApi.getAllHotels(params);
  },

  // 관리자: 승인 대기 호텔 목록
  getPendingHotels: async (params = {}) => {
    return await hotelApi.getPendingHotels(params);
  },

  // 관리자: 호텔 단일 조회
  getHotelById: async (hotelId) => {
    const response = await axiosClient.get(`/hotel/admin/${hotelId}`);
    // axiosClient 인터셉터가 이미 response.data를 반환하므로, response는 { success, message, data } 구조
    return response?.data || response;
  },

  // 관리자: 호텔 생성 (owner API 사용, admin도 사용 가능)
  createHotel: async (formData) => {
    return await hotelApi.createHotel(formData);
  },

  // 관리자: 호텔 수정 (owner API 사용, admin도 사용 가능)
  updateHotel: async (hotelId, formData) => {
    return await hotelApi.updateHotel(hotelId, formData);
  },

  // 관리자: 호텔 승인
  approveHotel: async (hotelId) => {
    return await hotelApi.approveHotel(hotelId);
  },

  // 관리자: 호텔 거절
  rejectHotel: async (hotelId) => {
    return await hotelApi.rejectHotel(hotelId);
  },

  // 관리자: 특정 호텔의 객실 목록 조회 (owner API 사용, admin도 사용 가능)
  getRoomsByHotel: async (hotelId) => {
    return await roomApi.getRoomsByHotel(hotelId);
  },
};

export default adminHotelApi;

