"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    static associate(models) {
      // Quiz dibuat oleh User (Guru/Admin)
      Quiz.belongsTo(models.User, { foreignKey: "created_by" });

      // Quiz memiliki banyak Upaya (Attempts)
      Quiz.hasMany(models.QuizAttempt, { foreignKey: "quiz_id" });
      
      // Quiz memiliki banyak Soal (Polymorphic)
      Quiz.hasMany(models.Question, { 
        foreignKey: "entity_id", 
        scope: { entity_type: 'quiz' }, 
        constraints: false 
      });
    }
  }
  Quiz.init(
    {
      title: DataTypes.STRING(255),
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