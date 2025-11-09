"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Quiz.belongsTo(models.User, { foreignKey: "created_by" });
      Quiz.hasMany(models.Question, { foreignKey: "quiz_id" });
      Quiz.hasMany(models.QuizAttempt, { foreignKey: "quiz_id" });
    }
  }
  Quiz.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      created_by: DataTypes.BIGINT,
      start_time: DataTypes.DATE,
      end_time: DataTypes.DATE,
      duration_minutes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Quiz",
    }
  );
  return Quiz;
};
