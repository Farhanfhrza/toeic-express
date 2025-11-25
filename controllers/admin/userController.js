const { User, Class } = require("../../models");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const { Op } = require("sequelize");

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
            class_id: role === "student" ? class_id : null,
        });

        res.status(201).json({ message: "User created", user });
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res
                .status(400)
                .json({ message: "Email or NISN already exists." });
        }
        console.error(err);
        res.status(500).json({
            message: "Failed to create user: " + err.message,
        });
    }
};

exports.bulkCreateUsers = async (req, res) => {
    // Pastikan file terunggah
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    try {
        // 1. Baca File Excel
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Konversi sheet ke array JSON
        // Header harus sesuai: Nama, Role, Identitas (Email/NISN), Password, Class (Level-Name)
        const excelData = XLSX.utils.sheet_to_json(worksheet, {
            header: ["Name", "Role", "Identifier", "Password", "Class"],
            range: 1, // Mulai dari baris kedua (asumsi baris pertama adalah header)
        });

        if (excelData.length === 0) {
            return res
                .status(400)
                .json({
                    message: "Excel file is empty or headers are incorrect.",
                });
        }

        const usersToCreate = [];
        const classesToFind = new Set();

        // 2. Pre-processing data dan validasi
        for (const row of excelData) {
            const { Name, Role, Identifier, Password, Class } = row;

            if (!Name || !Role || !Identifier || !Password) {
                // Lewati baris yang tidak lengkap atau tangani error lebih lanjut
                continue;
            }

            const userData = {
                name: String(Name).trim(),
                role: String(Role).toLowerCase().trim(),
                password: await bcrypt.hash(String(Password), 10),
                email: null,
                nisn: null,
                class_id: null,
            };

            if (userData.role === "student") {
                userData.nisn = String(Identifier).trim();
                if (Class) classesToFind.add(String(Class).trim());
            } else if (
                userData.role === "admin" ||
                userData.role === "teacher"
            ) {
                userData.email = String(Identifier).trim();
            } else {
                continue; // Abaikan role yang tidak valid
            }
            usersToCreate.push({
                ...userData,
                className: Class ? String(Class).trim() : null,
            });
        }

        // 3. Ambil Class IDs dari DB (jika ada siswa)
        const classMap = {};
        if (classesToFind.size > 0) {
            const classStrings = Array.from(classesToFind).map((c) =>
                c.split("-")
            );
            const classesFromDb = await Class.findAll({
                where: {
                    [Op.or]: classStrings.map(([level, name]) => ({
                        level: level.trim(),
                        name: name.trim(),
                    })),
                },
                attributes: ["id", "level", "name"],
            });

            classesFromDb.forEach((c) => {
                classMap[`${c.level}-${c.name}`] = c.id;
            });
        }

        // 4. Finalisasi Data untuk Bulk Create
        const finalUsers = usersToCreate.map((u) => {
            if (u.role === "student" && u.className) {
                u.class_id = classMap[u.className] || null; // Dapatkan ID kelas
            }
            // Hapus properti sementara sebelum create
            delete u.className;
            delete u.Identifier;
            return u;
        });

        // 5. Bulk Create ke Database
        const createdUsers = await User.bulkCreate(finalUsers, {
            validate: true,
        });

        res.status(201).json({
            message: `${createdUsers.length} users created successfully.`,
            count: createdUsers.length,
        });
    } catch (error) {
        console.error("Bulk Create Error:", error);
        res.status(500).json({
            message: "Processing failed: " + error.message,
        });
    }
};

// READ all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            // Mengambil semua user, dan menyertakan data dari tabel 'classes'
            include: [
                {
                    model: Class,
                    attributes: ["level", "name"], // Hanya ambil kolom yang relevan
                    required: false, // Gunakan LEFT JOIN agar user tanpa class_id (Admin/Guru) tetap terambil
                },
            ],
            attributes: ["id", "name", "email", "nisn", "role", "class_id"],
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users with class details:", error);
        res.status(500).json({
            message: "Server error during user retrieval.",
        });
    }
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
