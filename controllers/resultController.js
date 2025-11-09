const { QuizAttempt, Answer, Question, Option } = require('../models');

exports.submitQuiz = async (req, res) => {
  try {
    const { quiz_id, answers } = req.body;
    const user_id = req.user.id;

    // Simpan attempt
    const attempt = await QuizAttempt.create({
      quiz_id,
      user_id,
      started_at: new Date(),
      finished_at: new Date()
    });

    let score = 0;

    // Simpan tiap jawaban
    for (const ans of answers) {
      const option = await Option.findByPk(ans.option_id);
      if (option?.is_correct) score++;

      await Answer.create({
        attempt_id: attempt.id,
        question_id: ans.question_id,
        selected_option_id: ans.option_id,
        is_correct:ans.is_correct
      });
    }

    await attempt.update({ score: score });

    res.json({ message: 'Jawaban tersimpan', score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menyimpan hasil' });
  }
};

exports.getLatestResult = async (req, res) => {
  try {
    const user_id = req.user.id;
    const latest = await QuizAttempt.findOne({
      where: { user_id },
      order: [['createdAt', 'DESC']],
      include: ['Quiz']
    });

    const totalQuestions = await latest.Quiz.countQuestions();

    if (!latest)
      return res.status(404).json({ message: 'Belum ada hasil ujian' });

    // hitung ulang skor total
    const answers = await Answer.findAll({
      where: { attempt_id: latest.id },
      include: [{ model: Option }],
    });

    const score = answers.filter(a => a.Option.is_correct).length;

    res.json({
      quiz: latest.Quiz,
      score,
      total: totalQuestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil hasil terakhir' });
  }
};
