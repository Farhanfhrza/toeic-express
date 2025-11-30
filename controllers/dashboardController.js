const { User, Class, Material, MaterialProgress, ExerciseAttempt, ExerciseAnswer } = require("../models");

// Get dashboard data untuk student
exports.getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil data user dengan class
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Class,
                    attributes: ["id", "name", "level"],
                    required: false,
                },
            ],
            attributes: ["id", "name", "email", "nisn", "role"],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Ambil semua materials
        const allMaterials = await Material.findAll({
            attributes: ["id", "title", "menu_category"],
        });

        // Ambil progress user untuk semua materials
        const materialIds = allMaterials.map((m) => m.id);
        const userProgresses = await MaterialProgress.findAll({
            where: {
                user_id: userId,
                material_id: materialIds,
            },
            attributes: ["material_id", "is_completed", "completed_at"],
        });

        // Buat map progress
        const progressMap = {};
        userProgresses.forEach((progress) => {
            progressMap[progress.material_id] = {
                is_completed: progress.is_completed,
                completed_at: progress.completed_at,
            };
        });

        // Gabungkan materials dengan progress
        const materials = allMaterials.map((material) => {
            const materialData = material.toJSON();
            return {
                ...materialData,
                MaterialProgresses: progressMap[material.id]
                    ? [progressMap[material.id]]
                    : [],
            };
        });

        // Hitung statistik materials
        const listeningMaterials = materials.filter((m) => m.menu_category === "listening");
        const readingMaterials = materials.filter((m) => m.menu_category === "reading");

        const listeningCompleted = listeningMaterials.filter(
            (m) => m.MaterialProgresses && m.MaterialProgresses.length > 0 && m.MaterialProgresses[0].is_completed
        ).length;

        const readingCompleted = readingMaterials.filter(
            (m) => m.MaterialProgresses && m.MaterialProgresses.length > 0 && m.MaterialProgresses[0].is_completed
        ).length;

        // Ambil exercise attempts dengan material untuk progress overview
        const exerciseAttempts = await ExerciseAttempt.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Material,
                    attributes: ["id", "title", "menu_category"],
                },
            ],
            order: [["finished_at", "DESC"]],
            limit: 10, // Ambil 10 attempt terakhir
        });

        // Format progress overview data
        const progressOverview = exerciseAttempts.map((attempt) => {
            const material = attempt.Material;
            const category = material?.menu_category === "listening" ? "Listening" : "Reading";
            const subchapter = material?.title || "N/A";
            const score = attempt.score !== null ? `${attempt.score}` : "N/A";
            const totalQuestions = attempt.score !== null ? attempt.score : 0;

            // Hitung completion berdasarkan material progress
            let completion = "0%";
            if (material) {
                const materialProgress = materials.find((m) => m.id === material.id);
                if (materialProgress?.MaterialProgresses && materialProgress.MaterialProgresses.length > 0) {
                    completion = materialProgress.MaterialProgresses[0].is_completed ? "100%" : "In Progress";
                }
            }

            // Format last attempt date
            const lastAttempt = attempt.finished_at
                ? new Date(attempt.finished_at).toLocaleDateString("id-ID", {
                      month: "short",
                      day: "numeric",
                  })
                : "N/A";

            return {
                category,
                subchapter,
                score: attempt.score !== null ? `${attempt.score}` : "N/A",
                completion,
                lastAttempt,
                material_id: material?.id,
            };
        });

        // Format response
        res.json({
            success: true,
            profile: {
                name: user.name,
                nisn: user.nisn || user.email || "N/A",
                jurusan: user.Class ? `${user.Class.level} - ${user.Class.name}` : "N/A",
                kelas: user.Class ? `${user.Class.level}-${user.Class.name}` : "N/A",
            },
            materialStats: {
                listening: {
                    total: listeningMaterials.length,
                    completed: listeningCompleted,
                },
                reading: {
                    total: readingMaterials.length,
                    completed: readingCompleted,
                },
            },
            progressOverview,
        });
    } catch (error) {
        console.error("getStudentDashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

