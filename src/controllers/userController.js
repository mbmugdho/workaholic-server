import User from "../models/User.js";

export async function getMyProfile(req, res, next) {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findOne({ email }).select("email displayName photoURL role coins");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}