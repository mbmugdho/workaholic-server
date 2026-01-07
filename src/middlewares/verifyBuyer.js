export default function verifyBuyer(req, res, next) {
  if (req.user?.role !== "buyer") {
    return res.status(403).json({ success: false, message: "Buyer access required" });
  }
  next();
}