"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuizAttempt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      QuizAttempt.belongsTo(models.User, { foreignKey: "user_id" });
      QuizAttempt.belongsTo(models.Quiz, { foreignKey: "quiz_id" });
      QuizAttempt.hasMany(models.Answer, { foreignKey: "attempt_id" });
    }
  }
  QuizAttempt.init(
    {
      user_id: DataTypes.BIGINT,
      quiz_id: DataTypes.BIGINT,
      started_at: DataTypes.DATE,
      finished_at: DataTypes.DATE,
      score: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "QuizAttempt",
    }
  );
  return QuizAttempt;
};
