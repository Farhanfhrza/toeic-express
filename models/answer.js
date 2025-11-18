"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      // Jawaban milik satu Upaya Kuis
      Answer.belongsTo(models.QuizAttempt, { foreignKey: "attempt_id" });

      // Jawaban terkait dengan Soal dan Opsi yang dipilih
      Answer.belongsTo(models.Question, { foreignKey: "question_id" });
      Answer.belongsTo(models.Option, { foreignKey: "selected_option_id" });
    }
  }
  Answer.init(
    {
      attempt_id: DataTypes.BIGINT,
      question_id: DataTypes.BIGINT,
      selected_option_id: DataTypes.BIGINT,
      is_correct: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Answer",
    }
  );
  return Answer;
};