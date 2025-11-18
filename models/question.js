"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Soal milik Kuis (Jika entity_type='quiz')
      Question.belongsTo(models.Quiz, { 
        foreignKey: 'entity_id', 
        constraints: false, 
        as: 'quiz' 
      });
      // Soal milik Materi (Jika entity_type='material')
      Question.belongsTo(models.Material, { 
        foreignKey: 'entity_id', 
        constraints: false, 
        as: 'material' 
      });

      // Soal memiliki Opsi (Options), Jawaban Kuis (Answers), dan Jawaban Latihan (MaterialExerciseAnswers)
      Question.hasMany(models.Option, { foreignKey: "question_id" });
      Question.hasMany(models.Answer, { foreignKey: "question_id" });
      Question.hasMany(models.ExerciseAnswer, { foreignKey: "question_id" });
    }
  }
  Question.init(
    {
      entity_type: DataTypes.STRING(20),
      entity_id: DataTypes.BIGINT,
      question_type: DataTypes.STRING(20),
      question_text: DataTypes.TEXT,
      question_image: DataTypes.TEXT,
      question_audio: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};