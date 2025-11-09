const { User } = require("../../models");
const bcrypt = require("bcryptjs");

// CREATE user (guru/siswa)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, nisn } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: role === "student" ? null : email,
      password: hashed,
      role,
      nisn: role === "student" ? nisn : null,
    });

    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ all users
exports.getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    await User.update({ name, email, role }, { where: { id } });
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
