const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token tidak ditemukan' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

exports.isAdminOrTeacher = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "teacher") return next();
  return res.status(403).json({ message: "Akses ditolak" });
};

exports.isStudent = (req, res, next) => {
  if (req.user.role === "student") return next();
  return res.status(403).json({ message: "Akses hanya untuk siswa" });
};