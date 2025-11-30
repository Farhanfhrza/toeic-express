const { Class, User } = require("../../models");

// CREATE class
exports.createClass = async (req, res) => {
    try {
        const { name, level } = req.body;

        if (!name || !level) {
            return res.status(400).json({
                success: false,
                message: "Name and level are required",
            });
        }

        const newClass = await Class.create({
            name,
            level: parseInt(level),
        });

        res.status(201).json({
            success: true,
            message: "Class created successfully",
            class: newClass,
        });
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                success: false,
                message: "Class name already exists",
            });
        }
        console.error("Create class error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create class: " + err.message,
        });
    }
};

// READ all classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll({
            include: [
                {
                    model: User,
                    attributes: ["id", "name"],
                    required: false,
                },
            ],
            order: [["level", "ASC"], ["name", "ASC"]],
        });

        // Format response
        const formattedClasses = classes.map((cls) => {
            const classData = cls.toJSON();
            return {
                id: classData.id,
                name: classData.name,
                level: classData.level,
                studentCount: classData.Users ? classData.Users.length : 0,
            };
        });

        res.json({
            success: true,
            classes: formattedClasses,
        });
    } catch (error) {
        console.error("Get all classes error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch classes",
        });
    }
};

// READ single class
exports.getClassById = async (req, res) => {
    try {
        const { id } = req.params;
        const classData = await Class.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "email", "nisn"],
                    required: false,
                },
            ],
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        res.json({
            success: true,
            class: classData,
        });
    } catch (error) {
        console.error("Get class by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch class",
        });
    }
};

// UPDATE class
exports.updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, level } = req.body;

        const classData = await Class.findByPk(id);
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        await classData.update({
            name: name || classData.name,
            level: level ? parseInt(level) : classData.level,
        });

        res.json({
            success: true,
            message: "Class updated successfully",
            class: classData,
        });
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                success: false,
                message: "Class name already exists",
            });
        }
        console.error("Update class error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update class: " + err.message,
        });
    }
};

// DELETE class
exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const classData = await Class.findByPk(id);
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        // Cek apakah ada user yang menggunakan class ini
        const userCount = await User.count({
            where: { class_id: id },
        });

        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete class. There are ${userCount} students in this class. Please reassign them first.`,
            });
        }

        await classData.destroy();

        res.json({
            success: true,
            message: "Class deleted successfully",
        });
    } catch (err) {
        console.error("Delete class error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete class: " + err.message,
        });
    }
};



