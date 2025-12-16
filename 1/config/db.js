// config/db.js
import dotenv from "dotenv";
dotenv.config(); // 이 파일에서 .env를 바로 로드

import mongoose from "mongoose";

// .env 에서 MongoDB URI와 DB 이름을 가져옴
// .env 안에 MONGODB_URI 또는 MONGO_URI 가 반드시 있어야 함
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || "hotel-project";

if (!uri) {
  // 어떤 값이 들어있는지 로그로 한 번 찍어주면 디버깅에 도움됨
  console.error("MONGO_URI  :", process.env.MONGO_URI);
  console.error("MONGODB_URI:", process.env.MONGODB_URI);
  console.error("MongoDB URI (MONGO_URI or MONGODB_URI) is missing.");
  process.exit(1);
}

// 모든 모델에서 함께 쓰는 공용 Connection
export const dbConnection = mongoose.createConnection(uri, {
  serverSelectionTimeoutMS: 5000,
  dbName,
});

// 앱 시작 시 한 번만 호출해서 연결 확인
export const connectDB = async () => {
  try {
    await dbConnection.asPromise();
    console.log(`✅ MongoDB connection ready (${dbName})`);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};
