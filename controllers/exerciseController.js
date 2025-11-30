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

        // Hitung attempt_number berdasarkan jumlah attempt sebelumnya untuk user + material ini
        const previousAttempts = await ExerciseAttempt.count({
            where: {
                user_id: userId,
                material_id: materialId,
            },
        });

        const attemptNumber = previousAttempts + 1;

        const attempt = await ExerciseAttempt.create({
            user_id: userId,
            material_id: materialId,
            attempt_number: attemptNumber,
            score: null, // Awalnya null, akan diisi saat finish
            started_at: new Date(),
            finished_at: null,
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

        // Jika option_id null (tidak dijawab), dianggap salah
        if (!option_id) {
            // Cek apakah sudah ada jawaban untuk question ini
            const existingAnswer = await ExerciseAnswer.findOne({
                where: { attempt_id, question_id },
            });

            if (existingAnswer) {
                // Update existing answer
                existingAnswer.selected_option_id = null;
                existingAnswer.is_correct = 0;
                await existingAnswer.save();
                return res.json({ success: true, answer: existingAnswer });
            } else {
                // Create new answer dengan is_correct = 0
                const answer = await ExerciseAnswer.create({
                    attempt_id,
                    question_id,
                    selected_option_id: null,
                    is_correct: 0,
                });
                return res.json({ success: true, answer });
            }
        }

        const option = await Option.findOne({ where: { id: option_id } });
        if (!option) {
            return res
                .status(400)
                .json({ success: false, error: "Option not found" });
        }

        const isCorrect = option.is_correct ? 1 : 0;

        // Cek apakah sudah ada jawaban untuk question ini
        const existingAnswer = await ExerciseAnswer.findOne({
            where: { attempt_id, question_id },
        });

        if (existingAnswer) {
            // Update existing answer
            existingAnswer.selected_option_id = option_id;
            existingAnswer.is_correct = isCorrect;
            await existingAnswer.save();
            return res.json({ success: true, answer: existingAnswer });
        } else {
            // Create new answer
            const answer = await ExerciseAnswer.create({
                attempt_id,
                question_id,
                selected_option_id: option_id,
                is_correct: isCorrect,
            });
            return res.json({ success: true, answer });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Failed to submit answer",
        });
    }
};

// Submit semua jawaban sekaligus (untuk auto-submit)
exports.submitAllAnswers = async (req, res) => {
    try {
        console.log("submitAllAnswers called", { body: req.body, userId: req.user.id });
        const { attempt_id, answers } = req.body;
        const userId = req.user.id;

        const attempt = await ExerciseAttempt.findOne({
            where: { id: attempt_id, user_id: userId },
        });

        if (!attempt) {
            console.log("Attempt not found", { attempt_id, userId });
            return res
                .status(404)
                .json({ success: false, error: "Attempt not found" });
        }
        
        console.log("Attempt found, submitting answers...", { answersCount: answers?.length });

        // Submit semua jawaban
        for (const answer of answers) {
            const { question_id, option_id } = answer;

            // Cek apakah sudah ada jawaban
            const existingAnswer = await ExerciseAnswer.findOne({
                where: { attempt_id, question_id },
            });

            if (!option_id) {
                // Tidak dijawab = salah
                if (existingAnswer) {
                    existingAnswer.selected_option_id = null;
                    existingAnswer.is_correct = 0;
                    await existingAnswer.save();
                } else {
                    await ExerciseAnswer.create({
                        attempt_id,
                        question_id,
                        selected_option_id: null,
                        is_correct: 0,
                    });
                }
            } else {
                const option = await Option.findOne({ where: { id: option_id } });
                if (option) {
                    // Debug: Log option details
                    console.log("Option found:", {
                        option_id: option.id,
                        is_correct: option.is_correct,
                        is_correct_type: typeof option.is_correct,
                        is_correct_value: option.is_correct === true || option.is_correct === 1
                    });
                    
                    // Handle both boolean and integer types
                    const isCorrect = (option.is_correct === true || option.is_correct === 1) ? 1 : 0;
                    
                    console.log("Setting is_correct:", {
                        question_id,
                        option_id,
                        isCorrect,
                        option_is_correct: option.is_correct
                    });
                    
                    if (existingAnswer) {
                        existingAnswer.selected_option_id = option_id;
                        existingAnswer.is_correct = isCorrect;
                        await existingAnswer.save();
                        console.log("Updated answer:", {
                            question_id,
                            selected_option_id: existingAnswer.selected_option_id,
                            is_correct: existingAnswer.is_correct
                        });
                    } else {
                        const newAnswer = await ExerciseAnswer.create({
                            attempt_id,
                            question_id,
                            selected_option_id: option_id,
                            is_correct: isCorrect,
                        });
                        console.log("Created answer:", {
                            question_id,
                            selected_option_id: newAnswer.selected_option_id,
                            is_correct: newAnswer.is_correct
                        });
                    }
                } else {
                    console.log("Option not found for option_id:", option_id);
                }
            }
        }

        console.log("All answers submitted successfully");
        res.json({ success: true, message: "All answers submitted" });
    } catch (error) {
        console.error("Error in submitAllAnswers:", error);
        res.status(500).json({
            success: false,
            error: "Failed to submit all answers",
        });
    }
};

// Submit seluruh exercise (finish)
exports.finishExerciseAttempt = async (req, res) => {
    try {
        console.log("finishExerciseAttempt called", { body: req.body, userId: req.user.id });
        const { attempt_id } = req.body;
        const userId = req.user.id;

        const attempt = await ExerciseAttempt.findOne({
            where: { id: attempt_id, user_id: userId },
        });

        if (!attempt) {
            console.log("Attempt not found in finish", { attempt_id, userId });
            return res
                .status(404)
                .json({ success: false, error: "Attempt not found" });
        }

        // Jika attempt sudah finished, jangan update lagi
        if (attempt.finished_at) {
            console.log("Attempt already finished", { attempt_id, score: attempt.score });
            return res.json({
                success: true,
                score: attempt.score,
                message: "Attempt already finished",
            });
        }

        const answers = await ExerciseAnswer.findAll({
            where: { attempt_id },
        });

        const totalCorrect = answers.filter((a) => a.is_correct === 1 || a.is_correct === true).length;

        // Update attempt dengan score dan finished_at
        attempt.score = totalCorrect;
        attempt.finished_at = new Date();
        await attempt.save();

        console.log("Exercise finished successfully", { attempt_id, score: totalCorrect });
        res.json({ success: true, score: totalCorrect });
    } catch (error) {
        console.error("Error in finishExerciseAttempt:", error);
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

        // Cek jika attempt sudah finished - jangan izinkan akses lagi
        if (attempt.finished_at) {
            return res.status(403).json({
                success: false,
                error: "Attempt already finished. You cannot access questions anymore.",
                attempt: {
                    id: attempt.id,
                    finished_at: attempt.finished_at,
                    score: attempt.score,
                },
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
            attempt: {
                id: attempt.id,
                finished_at: attempt.finished_at,
            },
            questions: questions.map((q) => ({
                id: q.id,
                text: q.question_text,
                question_image: q.question_image || null,
                question_audio: q.question_audio || null,
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

// Get attempt review dengan soal dan jawaban user
exports.getAttemptReview = async (req, res) => {
    try {
        const attemptId = req.params.attemptId;
        const userId = req.user.id;

        // Cek attempt valid
        const attempt = await ExerciseAttempt.findOne({
            where: { id: attemptId, user_id: userId },
            include: [{ model: Material, attributes: ["id", "title"] }],
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

        // Ambil semua jawaban user untuk attempt ini
        const userAnswers = await ExerciseAnswer.findAll({
            where: { attempt_id: attemptId },
            include: [
                {
                    model: Option,
                    attributes: ["id", "label", "option_text", "is_correct"],
                    required: false, // LEFT JOIN karena selected_option_id bisa null
                },
            ],
        });

        // Buat map untuk akses cepat jawaban user per question
        const answerMap = {};
        console.log("Processing user answers for review:", { totalAnswers: userAnswers.length });
        userAnswers.forEach((answer) => {
            console.log("Review answer detail:", {
                question_id: answer.question_id,
                selected_option_id: answer.selected_option_id,
                is_correct: answer.is_correct,
                is_correct_type: typeof answer.is_correct,
                is_correct_value: answer.is_correct,
                option_exists: !!answer.Option,
                option_is_correct: answer.Option?.is_correct
            });
            
            answerMap[answer.question_id] = {
                selected_option_id: answer.selected_option_id,
                is_correct: answer.is_correct,
                selected_option: answer.Option ? {
                    id: answer.Option.id,
                    label: answer.Option.label,
                    text: answer.Option.option_text,
                    is_correct: answer.Option.is_correct,
                } : null,
            };
        });

        // Format response dengan soal, opsi, dan jawaban user
        const formattedQuestions = questions.map((q) => {
            const userAnswer = answerMap[q.id] || null;
            const correctOption = q.Options.find((o) => o.is_correct);

            return {
                id: q.id,
                text: q.question_text,
                options: q.Options.map((o) => ({
                    id: o.id,
                    label: o.label,
                    text: o.option_text,
                    is_correct: o.is_correct,
                })),
                user_answer: userAnswer,
                correct_option: correctOption ? {
                    id: correctOption.id,
                    label: correctOption.label,
                    text: correctOption.option_text,
                } : null,
            };
        });

        res.json({
            success: true,
            attempt: {
                id: attempt.id,
                score: attempt.score,
                total_questions: questions.length,
                started_at: attempt.started_at,
                finished_at: attempt.finished_at,
                material: attempt.Material,
            },
            questions: formattedQuestions,
        });
    } catch (error) {
        console.error("getAttemptReview error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch attempt review",
        });
    }
};
