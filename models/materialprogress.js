"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MaterialProgress extends Model {
    static associate(models) {
      // Progres milik satu User dan satu Material
      MaterialProgress.belongsTo(models.User, { foreignKey: "user_id" });
      MaterialProgress.belongsTo(models.Material, { foreignKey: "material_id" });
    }
  }
  MaterialProgress.init(
    {
      user_id: DataTypes.BIGINT,
      material_id: DataTypes.BIGINT,
      is_completed: DataTypes.BOOLEAN,
      completed_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "MaterialProgress",
      tableName: "user_material_progress",
      // Unique constraint: Satu siswa hanya satu progres per materi
      indexes: [{ unique: true, fields: ['user_id', 'material_id'] }]
    }
  );
  return MaterialProgress;
};