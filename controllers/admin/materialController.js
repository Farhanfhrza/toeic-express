const { Material, User, Question } = require("../../models");

// CREATE material
exports.createMaterial = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, content_text, menu_category, display_order, pdf_url } = req.body;

        if (!title || !content_text || !menu_category || !display_order) {
            return res.status(400).json({
                success: false,
                message: "Title, content_text, menu_category, and display_order are required",
            });
        }

        if (!["reading", "listening"].includes(menu_category)) {
            return res.status(400).json({
                success: false,
                message: "menu_category must be 'reading' or 'listening'",
            });
        }

        const material = await Material.create({
            title,
            content_text,
            menu_category,
            display_order: parseInt(display_order),
            pdf_url: pdf_url || null,
            created_by: userId,
        });

        res.status(201).json({
            success: true,
            message: "Material created successfully",
            material,
        });
    } catch (err) {
        console.error("Create material error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create material: " + err.message,
        });
    }
};

// READ all materials
exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.findAll({
            include: [
                {
                    model: User,
                    attributes: ["id", "name"],
                },
            ],
            order: [["menu_category", "ASC"], ["display_order", "ASC"]],
        });

        res.json({
            success: true,
            materials,
        });
    } catch (error) {
        console.error("Get all materials error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch materials",
        });
    }
};

// READ single material
exports.getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await Material.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ["id", "name"],
                },
                {
                    model: Question,
                    where: { entity_type: "material" },
                    required: false,
                },
            ],
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        res.json({
            success: true,
            material,
        });
    } catch (error) {
        console.error("Get material by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch material",
        });
    }
};

// UPDATE material
exports.updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content_text, menu_category, display_order, pdf_url } = req.body;

        const material = await Material.findByPk(id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        await material.update({
            title: title || material.title,
            content_text: content_text !== undefined ? content_text : material.content_text,
            menu_category: menu_category || material.menu_category,
            display_order: display_order ? parseInt(display_order) : material.display_order,
            pdf_url: pdf_url !== undefined ? pdf_url : material.pdf_url,
        });

        res.json({
            success: true,
            message: "Material updated successfully",
            material,
        });
    } catch (err) {
        console.error("Update material error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update material: " + err.message,
        });
    }
};

// DELETE material
exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        const material = await Material.findByPk(id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        await material.destroy();

        res.json({
            success: true,
            message: "Material deleted successfully",
        });
    } catch (err) {
        console.error("Delete material error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete material: " + err.message,
        });
    }
};

