import axiosClient from "./axiosClient";

export const favoriteApi = {
  // 내 즐겨찾기 목록 조회
  getMyFavorites: async () => {
    return await axiosClient.get("/favorite/me");
  },

  // 즐겨찾기 추가
  addFavorite: async (data) => {
    return await axiosClient.post("/favorite", data);
  },

  // 즐겨찾기 삭제
  removeFavorite: async (data) => {
    return await axiosClient.delete("/favorite", { data });
  },

  // 즐겨찾기 토글
  toggleFavorite: async (data) => {
    return await axiosClient.post("/favorite/toggle", data);
  },
};

export default favoriteApi;

