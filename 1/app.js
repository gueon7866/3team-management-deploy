import dotenv from "dotenv";
dotenv.config(); // .env를 가장 먼저 로드

import express from "express";
import cors from "cors";

console.log('MONGO_URI:', process.env.MONGO_URI);

import { connectDB } from "./config/db.js";              // MongoDB 연결 함수
import registerRoutes from "./routes/index.js";      // 도메인별 라우트 등록
import errorHandler from "./common/errorhandler.js"; // 공통 에러 핸들러

// Express 앱 생성
const app = express();

// MongoDB 연결
connectDB();

// 공통 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 등록
registerRoutes(app);

// 404 핸들러
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "NOT_FOUND",
    path: req.originalUrl,
  });
});

// 에러 핸들러 (항상 마지막)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB(); // ← user/business/service 세 개 연결
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server start error:", err.message);
    process.exit(1);
  }
};

startServer();

export default app;