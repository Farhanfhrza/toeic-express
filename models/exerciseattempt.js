"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExerciseAttempt extends Model {
    static associate(models) {
      // Upaya milik satu User dan satu Material
      ExerciseAttempt.belongsTo(models.User, { foreignKey: "user_id" });
      ExerciseAttempt.belongsTo(models.Material, {
        foreignKey: "material_id",
      });

      // Upaya memiliki banyak Jawaban Latihan
      ExerciseAttempt.hasMany(models.ExerciseAnswer, {
        foreignKey: "attempt_id",
      });
    }
  }
  ExerciseAttempt.init(
    {
      user_id: DataTypes.BIGINT,
      material_id: DataTypes.BIGINT,
      attempt_number: DataTypes.INTEGER,
      score: DataTypes.FLOAT,
      started_at: DataTypes.DATE,
      finished_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ExerciseAttempt",
      tableName: "material_exercise_attempts",
    }
  );
  return ExerciseAttempt;
};
