"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExerciseAnswer extends Model {
    static associate(models) {
      // Jawaban milik satu Upaya Latihan
      ExerciseAnswer.belongsTo(models.ExerciseAttempt, { foreignKey: "attempt_id" });

      // Jawaban terkait dengan Soal dan Opsi yang dipilih
      ExerciseAnswer.belongsTo(models.Question, { foreignKey: "question_id" });
      ExerciseAnswer.belongsTo(models.Option, { foreignKey: "selected_option_id" });
    }
  }
  ExerciseAnswer.init(
    {
      attempt_id: DataTypes.BIGINT,
      question_id: DataTypes.BIGINT,
      selected_option_id: DataTypes.BIGINT,
      is_correct: DataTypes.BOOLEAN,
      answered_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ExerciseAnswer",
      tableName: "ExerciseAnswers",
    }
  );
  return ExerciseAnswer;
};