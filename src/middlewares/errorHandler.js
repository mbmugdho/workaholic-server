export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}