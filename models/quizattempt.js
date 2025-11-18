"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuizAttempt extends Model {
    static associate(models) {
      // Upaya milik satu User dan satu Quiz
      QuizAttempt.belongsTo(models.User, { foreignKey: "user_id" });
      QuizAttempt.belongsTo(models.Quiz, { foreignKey: "quiz_id" });

      // Upaya memiliki banyak Jawaban
      QuizAttempt.hasMany(models.Answer, { foreignKey: "attempt_id" });
    }
  }
  QuizAttempt.init(
    {
      user_id: DataTypes.BIGINT,
      quiz_id: DataTypes.BIGINT,
      started_at: DataTypes.DATE,
      finished_at: DataTypes.DATE,
      total_score: DataTypes.FLOAT,
      reading_score: DataTypes.FLOAT,
      listening_score: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "QuizAttempt",
    }
  );
  return QuizAttempt;
};