const { Material, MaterialProgress } = require("../models");

exports.getMaterialsByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        const userId = req.user?.id; // Ambil user ID dari token

        if (!category || !["reading", "listening"].includes(category)) {
            return res.status(400).json({
                message: "Invalid or missing category parameter",
            });
        }

        const materials = await Material.findAll({
            where: { menu_category: category },
            order: [["display_order", "ASC"]],
            attributes: ["id", "title", "pdf_url", "display_order", "content_text"],
        });

        // Ambil progress untuk user jika ada userId
        let progressMap = {};
        if (userId) {
            const materialIds = materials.map((m) => m.id);
            const progresses = await MaterialProgress.findAll({
                where: {
                    user_id: userId,
                    material_id: materialIds,
                },
                attributes: ["material_id", "is_completed", "completed_at"],
            });

            // Buat map untuk akses cepat
            progresses.forEach((progress) => {
                progressMap[progress.material_id] = {
                    is_completed: progress.is_completed,
                    completed_at: progress.completed_at,
                };
            });
        }

        // Format response untuk memudahkan frontend
        const formattedMaterials = materials.map((material) => {
            return {
                id: material.id,
                title: material.title,
                pdf_url: material.pdf_url,
                display_order: material.display_order,
                content_text: material.content_text,
                progress: progressMap[material.id] || null,
            };
        });

        return res.json(formattedMaterials);
    } catch (error) {
        console.error("getMaterialsByCategory error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Mark material as "sedang dipelajari" (dipanggil saat membuka detail)
exports.startMaterial = async (req, res) => {
    try {
        const userId = req.user.id;
        const { materialId } = req.params;

        // Cek apakah material ada
        const material = await Material.findByPk(materialId);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        // Cari atau buat progress
        const [progress, created] = await MaterialProgress.findOrCreate({
            where: {
                user_id: userId,
                material_id: materialId,
            },
            defaults: {
                user_id: userId,
                material_id: materialId,
                is_completed: false,
                completed_at: null,
            },
        });

        // Jika sudah ada tapi belum selesai, tidak perlu update
        // Jika sudah selesai, tetap selesai (tidak diubah)
        if (!created && progress.is_completed) {
            return res.json({
                success: true,
                message: "Material already completed",
                progress: {
                    is_completed: progress.is_completed,
                    completed_at: progress.completed_at,
                },
            });
        }

        // Update jika belum selesai (pastikan is_completed = false)
        if (!progress.is_completed) {
            await progress.update({
                is_completed: false,
                completed_at: null,
            });
        }

        res.json({
            success: true,
            message: "Material marked as in progress",
            progress: {
                is_completed: progress.is_completed,
                completed_at: progress.completed_at,
            },
        });
    } catch (error) {
        console.error("startMaterial error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Mark material as "selesai"
exports.completeMaterial = async (req, res) => {
    try {
        const userId = req.user.id;
        const { materialId } = req.params;

        // Cek apakah material ada
        const material = await Material.findByPk(materialId);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        // Cari atau buat progress
        const [progress, created] = await MaterialProgress.findOrCreate({
            where: {
                user_id: userId,
                material_id: materialId,
            },
            defaults: {
                user_id: userId,
                material_id: materialId,
                is_completed: true,
                completed_at: new Date(),
            },
        });

        // Update progress menjadi selesai
        await progress.update({
            is_completed: true,
            completed_at: new Date(),
        });

        res.json({
            success: true,
            message: "Material marked as completed",
            progress: {
                is_completed: progress.is_completed,
                completed_at: progress.completed_at,
            },
        });
    } catch (error) {
        console.error("completeMaterial error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Get material detail dengan progress
exports.getMaterialDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { materialId } = req.params;

        const material = await Material.findByPk(materialId, {
            attributes: ["id", "title", "pdf_url", "display_order", "content_text", "menu_category"],
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        // Ambil progress user untuk material ini
        const progress = await MaterialProgress.findOne({
            where: {
                user_id: userId,
                material_id: materialId,
            },
            attributes: ["is_completed", "completed_at"],
        });

        res.json({
            success: true,
            material: {
                ...material.toJSON(),
                progress: progress
                    ? {
                          is_completed: progress.is_completed,
                          completed_at: progress.completed_at,
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error("getMaterialDetail error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
