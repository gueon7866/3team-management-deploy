export default function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
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
