// ⬇⬇ routes/index.js 전체를 이걸로 교체 ⬇⬇
import authRoute from "../auth/route.js";
import hotelRoute from "../hotel/route.js";
import reservationRoute from "../reservation/route.js";
import roomRoute from "../room/route.js";
import couponRoute from "../coupon/route.js";
import dashboardRoute from "../dashboard/route.js";
import reviewRoute from "../review/route.js";
import userRoute from "../user/route.js";
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
