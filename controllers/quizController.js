const { Quiz, Question, Option } = require('../models');

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.findAll();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data kuis' });
  }
};

exports.getQuizDetail = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: {
        model: Question,
        include: [Option]
      }
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail kuis' });
  }
};
