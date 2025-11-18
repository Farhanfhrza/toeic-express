"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ScoreConversion extends Model {
    static associate(models) {
      // Tidak ada hubungan langsung dengan tabel lain
    }
  }
  ScoreConversion.init(
    {
      type: DataTypes.STRING(20), // 'reading' atau 'listening'
      correct_answers_count: DataTypes.INTEGER,
      converted_score: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ScoreConversion",
      tableName: "score_conversion_scales",
      // Pastikan unique constraint di level model juga jika diperlukan:
      // indexes: [{ unique: true, fields: ['type', 'correct_answers_count'] }]
    }
  );
  return ScoreConversion;
};
