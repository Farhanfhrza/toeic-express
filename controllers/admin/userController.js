const { User, Class, MaterialProgress, ExerciseAttempt, Material } = require("../../models");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const { Op } = require("sequelize");

// CREATE user (guru/siswa)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, nisn, class_id } = req.body;

        if (!name || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, password, and role are required",
            });
        }

        if (role === "student" && !nisn) {
            return res.status(400).json({
                success: false,
                message: "NISN is required for students",
            });
        }

        if ((role === "admin" || role === "teacher") && !email) {
            return res.status(400).json({
                success: false,
                message: "Email is required for admin/teacher",
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email: role === "student" ? null : email,
            password: hashed,
            role,
            nisn: role === "student" ? nisn : null,
            class_id: role === "student" && class_id ? parseInt(class_id) : null,
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
        });
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                success: false,
                message: "Email or NISN already exists.",
            });
        }
        console.error("Create user error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create user: " + err.message,
        });
    }
};

// exports.bulkCreateUsers = async (req, res) => {
//     // Pastikan file terunggah
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded." });
//     }

//     try {
//         // 1. Baca File Excel
//         const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];

//         // Konversi sheet ke array JSON
//         // Header harus sesuai: Nama, Role, Identitas (Email/NISN), Password, Class (Level-Name)
//         const excelData = XLSX.utils.sheet_to_json(worksheet, {
//             header: ["Name", "Role", "Identifier", "Password", "Class"],
//             range: 1, // Mulai dari baris kedua (asumsi baris pertama adalah header)
//         });

//         if (excelData.length === 0) {
//             return res
//                 .status(400)
//                 .json({
//                     message: "Excel file is empty or headers are incorrect.",
//                 });
//         }

//         const usersToCreate = [];
//         const classesToFind = new Set();

//         // 2. Pre-processing data dan validasi
//         for (const row of excelData) {
//             const { Name, Role, Identifier, Password, Class } = row;

//             if (!Name || !Role || !Identifier || !Password) {
//                 // Lewati baris yang tidak lengkap atau tangani error lebih lanjut
//                 continue;
//             }

//             const userData = {
//                 name: String(Name).trim(),
//                 role: String(Role).toLowerCase().trim(),
//                 password: await bcrypt.hash(String(Password), 10),
//                 email: null,
//                 nisn: null,
//                 class_id: null,
//             };

//             if (userData.role === "student") {
//                 userData.nisn = String(Identifier).trim();
//                 if (Class) classesToFind.add(String(Class).trim());
//             } else if (
//                 userData.role === "admin" ||
//                 userData.role === "teacher"
//             ) {
//                 userData.email = String(Identifier).trim();
//             } else {
//                 continue; // Abaikan role yang tidak valid
//             }
//             usersToCreate.push({
//                 ...userData,
//                 className: Class ? String(Class).trim() : null,
//             });
//         }

//         // 3. Ambil Class IDs dari DB (jika ada siswa)
//         const classMap = {};
//         if (classesToFind.size > 0) {
//             const classStrings = Array.from(classesToFind).map((c) =>
//                 c.split("-")
//             );
//             const classesFromDb = await Class.findAll({
//                 where: {
//                     [Op.or]: classStrings.map(([level, name]) => ({
//                         level: level.trim(),
//                         name: name.trim(),
//                     })),
//                 },
//                 attributes: ["id", "level", "name"],
//             });

//             classesFromDb.forEach((c) => {
//                 classMap[`${c.level}-${c.name}`] = c.id;
//             });
//         }

//         // 4. Finalisasi Data untuk Bulk Create
//         const finalUsers = usersToCreate.map((u) => {
//             if (u.role === "student" && u.className) {
//                 u.class_id = classMap[u.className] || null; // Dapatkan ID kelas
//             }
//             // Hapus properti sementara sebelum create
//             delete u.className;
//             delete u.Identifier;
//             return u;
//         });

//         // 5. Bulk Create ke Database
//         const createdUsers = await User.bulkCreate(finalUsers, {
//             validate: true,
//         });

//         res.status(201).json({
//             message: `${createdUsers.length} users created successfully.`,
//             count: createdUsers.length,
//         });
//     } catch (error) {
//         console.error("Bulk Create Error:", error);
//         res.status(500).json({
//             message: "Processing failed: " + error.message,
//         });
//     }
// };

// READ all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [
                {
                    model: Class,
                    attributes: ["id", "level", "name"],
                    required: false,
                },
            ],
            attributes: ["id", "name", "email", "nisn", "role", "class_id"],
            order: [["role", "ASC"], ["name", "ASC"]],
        });
        res.json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Error fetching users with class details:", error);
        res.status(500).json({
            success: false,
            message: "Server error during user retrieval.",
        });
    }
};

// UPDATE user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, nisn, class_id, password } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email !== undefined) updateData.email = role === "student" ? null : email;
        if (role) updateData.role = role;
        if (nisn !== undefined) updateData.nisn = role === "student" ? nisn : null;
        if (class_id !== undefined) updateData.class_id = role === "student" && class_id ? parseInt(class_id) : null;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await user.update(updateData);

        res.json({
            success: true,
            message: "User updated successfully",
            user,
        });
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                success: false,
                message: "Email or NISN already exists",
            });
        }
        console.error("Update user error:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// READ single user
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            include: [
                {
                    model: Class,
                    attributes: ["id", "level", "name"],
                    required: false,
                },
            ],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get user by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};

// Get user detail with progress and exercise attempts
exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                {
                    model: Class,
                    attributes: ["id", "level", "name"],
                    required: false,
                },
            ],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Get material progress
        const materialProgress = await MaterialProgress.findAll({
            where: { user_id: id },
            include: [
                {
                    model: Material,
                    attributes: ["id", "title", "menu_category"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Get exercise attempts
        const exerciseAttempts = await ExerciseAttempt.findAll({
            where: { user_id: id },
            include: [
                {
                    model: Material,
                    attributes: ["id", "title", "menu_category"],
                },
            ],
            order: [["finished_at", "DESC"]],
        });

        // Format progress data
        const progressData = materialProgress.map((progress) => ({
            material_id: progress.material_id,
            material_title: progress.Material?.title || "N/A",
            material_category: progress.Material?.menu_category || "N/A",
            is_completed: progress.is_completed,
            completed_at: progress.completed_at,
        }));

        // Format exercise attempts data
        const exerciseData = exerciseAttempts.map((attempt) => ({
            id: attempt.id,
            material_id: attempt.material_id,
            material_title: attempt.Material?.title || "N/A",
            material_category: attempt.Material?.menu_category || "N/A",
            attempt_number: attempt.attempt_number,
            score: attempt.score,
            started_at: attempt.started_at,
            finished_at: attempt.finished_at,
        }));

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                nisn: user.nisn,
                role: user.role,
                Class: user.Class,
            },
            progress: progressData,
            exercises: exerciseData,
        });
    } catch (error) {
        console.error("Get user detail error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user detail",
        });
    }
};

// Bulk create users from Excel
exports.bulkCreateUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const { class_id } = req.body;

        if (!class_id) {
            return res.status(400).json({
                success: false,
                message: "Class ID is required",
            });
        }

        // Verify class exists
        const classData = await Class.findByPk(class_id);
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        // Read Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON (expecting columns: Nama, NISN)
        const excelData = XLSX.utils.sheet_to_json(worksheet, {
            header: ["name", "nisn"],
            range: 1, // Skip header row
        });

        if (excelData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Excel file is empty or format is incorrect",
            });
        }

        // Process and validate data
        const usersToCreate = [];
        const errors = [];

        for (let i = 0; i < excelData.length; i++) {
            const row = excelData[i];
            const name = String(row.name || "").trim();
            const nisn = String(row.nisn || "").trim();

            if (!name || !nisn) {
                errors.push(`Baris ${i + 2}: Nama atau NISN kosong`);
                continue;
            }

            // Password = NISN + "*"
            const password = nisn + "*";
            const hashedPassword = await bcrypt.hash(password, 10);

            usersToCreate.push({
                name,
                nisn,
                password: hashedPassword,
                role: "student",
                class_id: parseInt(class_id),
                email: null,
            });
        }

        if (usersToCreate.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid users to create",
                errors,
            });
        }

        // Bulk create users
        const createdUsers = await User.bulkCreate(usersToCreate, {
            validate: true,
            ignoreDuplicates: true, // Skip jika NISN sudah ada
        });

        res.status(201).json({
            success: true,
            message: `${createdUsers.length} siswa berhasil ditambahkan`,
            created: createdUsers.length,
            total: usersToCreate.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Bulk create users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create users: " + error.message,
        });
    }
};

// DELETE user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
