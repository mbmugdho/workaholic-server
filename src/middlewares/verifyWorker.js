export default function verifyWorker(req, res, next) {
  if (req.user?.role !== "worker") {
    return res.status(403).json({ success: false, message: "Worker access required" });
  }
  next();
}