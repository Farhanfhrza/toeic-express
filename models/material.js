"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Material extends Model {
    static associate(models) {
      // Materi dibuat oleh User (Guru/Admin)
      Material.belongsTo(models.User, { foreignKey: "created_by" });

      // Materi memiliki banyak Progres Siswa
      Material.hasMany(models.MaterialProgress, {
        foreignKey: "material_id",
      });
      // Materi memiliki banyak Upaya Latihan
      Material.hasMany(models.ExerciseAttempt, {
        foreignKey: "material_id",
      });

      // Materi memiliki banyak Soal (Latihan - Polymorphic)
      Material.hasMany(models.Question, {
        foreignKey: "entity_id",
        scope: { entity_type: "material" },
        constraints: false,
      });
    }
  }
  Material.init(
    {
      title: DataTypes.STRING(255),
      content_text: DataTypes.TEXT,
      menu_category: DataTypes.STRING(20), // 'reading' atau 'listening'
      display_order: DataTypes.INTEGER,
      pdf_url: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Material",
    }
  );
  return Material;
};
