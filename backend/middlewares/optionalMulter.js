// middlewares/optionalMulter.js
// 요청이 multipart/form-data 인 경우에만 multer 미들웨어를 실행

export default function optionalMulter(multerMiddleware) {
  return (req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("multipart/form-data")) {
      return multerMiddleware(req, res, next);
    }
    return next();
  };
}
