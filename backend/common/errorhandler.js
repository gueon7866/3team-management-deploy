export default function errorHandler(err, req, res, next) {
  console.error(err);

  // multer/multer-s3 에러 합리적으로 400 처리
  if (err && err.name === "MulterError") {
    err.status = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      err.message = "FILE_TOO_LARGE";
    }
  }
  // 서비스 레이어가 statusCode 쓰는 경우도 포용
  const status = err.status || err.statusCode || 500;
  const message = err.message || "INTERNAL_SERVER_ERROR";

  const responseBody = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development" && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(status).json(responseBody);
}
