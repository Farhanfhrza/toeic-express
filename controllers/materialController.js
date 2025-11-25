const { Material } = require("../models");

exports.getMaterialsByCategory = async (req, res) => {
    try {
        const { category } = req.query;

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

        return res.json(materials);
    } catch (error) {
        console.error("getMaterialsByCategory error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
