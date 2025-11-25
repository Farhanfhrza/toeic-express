const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier = email (guru/admin) atau NISN (siswa)

    const user = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { email: identifier },
          { nisn: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login berhasil",
      user: { id: user.id, name: user.name, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.logout = (req, res) => {
  try {
    res.json({
      message: "Logout berhasil. Harap hapus token otentikasi di sisi klien.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
