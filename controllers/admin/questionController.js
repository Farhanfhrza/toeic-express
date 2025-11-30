const { Question, Option, Material, Quiz } = require("../../models");

// CREATE question with options
exports.createQuestion = async (req, res) => {
    try {
        const { entity_type, entity_id, question_type, question_text, question_image, question_audio, options } = req.body;

        if (!entity_type || !entity_id || !question_type || !question_text || !options || !Array.isArray(options)) {
            return res.status(400).json({
                success: false,
                message: "entity_type, entity_id, question_type, question_text, and options array are required",
            });
        }

        if (!["reading", "listening"].includes(question_type)) {
            return res.status(400).json({
                success: false,
                message: "question_type must be 'reading' or 'listening'",
            });
        }

        if (!["quiz", "material"].includes(entity_type)) {
            return res.status(400).json({
                success: false,
                message: "entity_type must be 'quiz' or 'material'",
            });
        }

        // Validasi options
        if (options.length < 2 || options.length > 4) {
            return res.status(400).json({
                success: false,
                message: "Question must have 2-4 options",
            });
        }

        const correctOptions = options.filter((opt) => opt.is_correct);
        if (correctOptions.length !== 1) {
            return res.status(400).json({
                success: false,
                message: "Question must have exactly one correct answer",
            });
        }

        // Buat question
        const question = await Question.create({
            entity_type,
            entity_id: parseInt(entity_id),
            question_type,
            question_text,
            question_image: question_image || null,
            question_audio: question_audio || null,
        });

        // Buat options
        const createdOptions = [];
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const option = await Option.create({
                question_id: question.id,
                label: String.fromCharCode(65 + i), // A, B, C, D
                option_text: opt.option_text,
                is_correct: opt.is_correct || false,
            });
            createdOptions.push(option);
        }

        res.status(201).json({
            success: true,
            message: "Question created successfully",
            question: {
                ...question.toJSON(),
                Options: createdOptions,
            },
        });
    } catch (err) {
        console.error("Create question error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create question: " + err.message,
        });
    }
};

// READ all questions
exports.getAllQuestions = async (req, res) => {
    try {
        const { entity_type, entity_id } = req.query;

        const whereClause = {};
        if (entity_type) whereClause.entity_type = entity_type;
        if (entity_id) whereClause.entity_id = parseInt(entity_id);

        const questions = await Question.findAll({
            where: whereClause,
            include: [
                {
                    model: Option,
                    attributes: ["id", "label", "option_text", "is_correct"],
                },
            ],
            order: [["id", "ASC"]],
        });

        res.json({
            success: true,
            questions,
        });
    } catch (error) {
        console.error("Get all questions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
        });
    }
};

// READ single question
exports.getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findByPk(id, {
            include: [
                {
                    model: Option,
                    attributes: ["id", "label", "option_text", "is_correct"],
                },
            ],
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        res.json({
            success: true,
            question,
        });
    } catch (error) {
        console.error("Get question by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch question",
        });
    }
};

// UPDATE question
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question_text, question_image, question_audio, question_type, options } = req.body;

        const question = await Question.findByPk(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        // Update question
        await question.update({
            question_text: question_text !== undefined ? question_text : question.question_text,
            question_image: question_image !== undefined ? question_image : question.question_image,
            question_audio: question_audio !== undefined ? question_audio : question.question_audio,
            question_type: question_type || question.question_type,
        });

        // Update options if provided
        if (options && Array.isArray(options)) {
            // Delete existing options
            await Option.destroy({ where: { question_id: id } });

            // Create new options
            for (let i = 0; i < options.length; i++) {
                const opt = options[i];
                await Option.create({
                    question_id: id,
                    label: String.fromCharCode(65 + i),
                    option_text: opt.option_text,
                    is_correct: opt.is_correct || false,
                });
            }
        }

        // Fetch updated question with options
        const updatedQuestion = await Question.findByPk(id, {
            include: [{ model: Option }],
        });

        res.json({
            success: true,
            message: "Question updated successfully",
            question: updatedQuestion,
        });
    } catch (err) {
        console.error("Update question error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update question: " + err.message,
        });
    }
};

// DELETE question
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findByPk(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        // Delete options first (cascade should handle this, but explicit is better)
        await Option.destroy({ where: { question_id: id } });

        // Delete question
        await question.destroy();

        res.json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (err) {
        console.error("Delete question error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete question: " + err.message,
        });
    }
};



