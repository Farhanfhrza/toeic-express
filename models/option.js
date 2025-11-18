"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    static associate(models) {
      // Opsi milik satu Soal
      Option.belongsTo(models.Question, { foreignKey: "question_id" });

      // Opsi adalah pilihan yang dipilih dalam Jawaban Kuis/Latihan
      Option.hasMany(models.Answer, { foreignKey: "selected_option_id" });
      Option.hasMany(models.ExerciseAnswer, { foreignKey: "selected_option_id" });
    }
  }
  Option.init(
    {
      question_id: DataTypes.BIGINT,
      label: DataTypes.CHAR(1),
      option_text: DataTypes.TEXT,
      is_correct: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Option",
    }
  );
  return Option;
};