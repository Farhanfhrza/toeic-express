"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Answer.belongsTo(models.QuizAttempt, { foreignKey: "attempt_id" });
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
