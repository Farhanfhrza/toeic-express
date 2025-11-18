"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Class extends Model {
    static associate(models) {
      // Satu Kelas memiliki banyak User (Siswa)
      Class.hasMany(models.User, { foreignKey: "class_id" });
    }
  }
  Class.init(
    {
      name: { type: DataTypes.STRING(50), unique: true },
      level: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Class",
    }
  );
  return Class;
};
