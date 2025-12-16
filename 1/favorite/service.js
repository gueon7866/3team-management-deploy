// favorite/service.js
import Favorite from "./model.js";

// 내 즐겨찾기 목록
export const getMyFavorites = async (userId) => {
  return await Favorite.find({ user: userId })
    .populate("hotel", "name city images ratingAverage ratingCount")
    .sort({ createdAt: -1 });
};

// 즐겨찾기 추가
export const addFavorite = async (userId, hotelId) => {
  const fav = await Favorite.findOne({ user: userId, hotel: hotelId });
  if (fav) return fav;

  const created = await Favorite.create({ user: userId, hotel: hotelId });
  return created;
};

// 즐겨찾기 제거
export const removeFavorite = async (userId, hotelId) => {
  await Favorite.deleteOne({ user: userId, hotel: hotelId });
  return true;
};

// 토글
export const toggleFavorite = async (userId, hotelId) => {
  const fav = await Favorite.findOne({ user: userId, hotel: hotelId });
  if (fav) {
    await Favorite.deleteOne({ _id: fav._id });
    return { removed: true };
  } else {
    const created = await Favorite.create({ user: userId, hotel: hotelId });
    return { removed: false, favorite: created };
  }
};
