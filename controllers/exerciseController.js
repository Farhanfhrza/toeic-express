const {
    Material,
    Question,
    Option,
    ExerciseAttempt,
    ExerciseAnswer,
    User,
} = require("../models");

// List exercise berdasarkan materi (list untuk page list latihan)
exports.getExercisesByMaterial = async (req, res) => {
    try {
        const materialId = req.params.materialId;

        const questions = await Question.findAll({
            where: { material_id: materialId },
            include: [{ model: Option }],
            order: [["id", "ASC"]],
        });

        res.json({ success: true, questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch exercises",
        });
    }
};

// Ambil satu soal by ID
exports.getExerciseQuestion = async (req, res) => {
    try {
        const questionId = req.params.questionId;

        const question = await Question.findOne({
            where: { id: questionId },
            include: [{ model: Option }],
        });

        if (!question) {
            return res
                .status(404)
                .json({ success: false, error: "Question not found" });
        }

        res.json({ success: true, question });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch question",
        });
    }
};

// Buat attempt baru (start exercise)
exports.startExerciseAttempt = async (req, res) => {
    try {
        const userId = req.user.id;
        const materialId = req.body.material_id;

        const attempt = await ExerciseAttempt.create({
            user_id: userId,
            material_id: materialId,
            score: 0,
            completed: false,
        });

        res.json({ success: true, attempt });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Failed to start exercise attempt",
        });
    }
};

// Submit jawaban per soal
exports.submitExerciseAnswer = async (req, res) => {
    try {
        const { attempt_id, question_id, option_id } = req.body;
        const userId = req.user.id;

        const attempt = await ExerciseAttempt.findOne({
            where: { id: attempt_id, user_id: userId },
        });

        if (!attempt) {
            return res
                .status(404)
                .json({ success: false, error: "Attempt not found" });
        }

        const option = await Option.findOne({ where: { id: option_id } });
        if (!option) {
            return res
                .status(400)
                .json({ success: false, error: "Option not found" });
        }

        const isCorrect = option.is_correct ? 1 : 0;

        const answer = await ExerciseAnswer.create({
            attempt_id,
            question_id,
            option_id,
            is_correct: isCorrect,
        });

        res.json({ success: true, answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Failed to submit answer",
        });
    }
};

// Submit seluruh exercise (finish)
exports.finishExerciseAttempt = async (req, res) => {
    try {
        const { attempt_id } = req.body;
        const userId = req.user.id;

        const attempt = await ExerciseAttempt.findOne({
            where: { id: attempt_id, user_id: userId },
        });

        if (!attempt) {
            return res
                .status(404)
                .json({ success: false, error: "Attempt not found" });
        }

        const answers = await ExerciseAnswer.findAll({
            where: { attempt_id },
        });

        const totalCorrect = answers.filter((a) => a.is_correct).length;

        attempt.score = totalCorrect;
        attempt.completed = true;
        await attempt.save();

        res.json({ success: true, score: totalCorrect });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Failed to finish exercise",
        });
    }
};

// Riwayat attempt user
exports.getExerciseAttempts = async (req, res) => {
    try {
        const userId = req.user.id;

        const attempts = await ExerciseAttempt.findAll({
            where: { user_id: userId },
            include: [{ model: Material }],
            order: [["createdAt", "DESC"]],
        });

        res.json({ success: true, attempts });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch attempts",
        });
    }
};

exports.getQuestionsByAttempt = async (req, res) => {
    try {
        const attemptId = req.params.attemptId;
        const userId = req.user.id;

        // Cek attempt valid
        const attempt = await ExerciseAttempt.findOne({
            where: { id: attemptId, user_id: userId },
        });

        if (!attempt) {
            return res.status(404).json({
                success: false,
                error: "Attempt not found",
            });
        }

        // Ambil semua soal untuk material ini
        const questions = await Question.findAll({
            where: { entity_type: "material", entity_id: attempt.material_id },
            include: [{ model: Option }],
            order: [["id", "ASC"]],
        });

        res.json({
            success: true,
            questions: questions.map((q) => ({
                id: q.id,
                text: q.question_text,
                Options: q.Options.map((o) => ({
                    id: o.id,
                    text: o.option_text,
                })),
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch attempt questions",
        });
    }
};
