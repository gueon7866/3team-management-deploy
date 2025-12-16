// ⬇⬇ routes/index.js 전체를 이걸로 교체 ⬇⬇
import authRoute from "../../../1/auth/route.js";
import hotelRoute from "../../../1/hotel/route.js";
import reservationRoute from "../../../1/reservation/route.js";
import roomRoute from "../../../1/room/route.js";
import couponRoute from "../../../1/coupon/route.js";
import dashboardRoute from "../../../1/dashboard/route.js";
import reviewRoute from "../../../1/review/route.js";
import userRoute from "../../../1/user/route.js";
const registerRoutes = (app) => {
  app.use("/api/auth", authRoute);
  app.use("/api/hotel", hotelRoute);
  app.use("/api/reservation", reservationRoute);
  app.use("/api/room", roomRoute);
  app.use("/api/coupons", couponRoute);
  app.use("/api/dashboard", dashboardRoute);
  app.use("/api/reviews", reviewRoute);
  app.use("/api/user/", userRoute);
};

export default registerRoutes;
// ⬆⬆ routes/index.js 전체 교체 끝 ⬆⬆
