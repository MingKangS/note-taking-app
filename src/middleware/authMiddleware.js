const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = verified.exp - currentTime;

    if (timeLeft < 60 * 10) {
      const newAccessToken = jwt.sign(
        { userId: verified.userId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.setHeader("Authorization", `Bearer ${newAccessToken}`);
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
