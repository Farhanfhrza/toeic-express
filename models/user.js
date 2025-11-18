"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Siswa memiliki Kelas
      User.belongsTo(models.Class, { foreignKey: "class_id" });

      // Guru/Admin membuat Kuis & Materi
      User.hasMany(models.Quiz, { foreignKey: "created_by" });
      User.hasMany(models.Material, { foreignKey: "created_by" });

      // Siswa memiliki Upaya Kuis, Progres Materi, dan Upaya Latihan
      User.hasMany(models.QuizAttempt, { foreignKey: "user_id" });
      User.hasMany(models.MaterialProgress, { foreignKey: "user_id" });
      User.hasMany(models.ExerciseAttempt, { foreignKey: "user_id" });
    }
  }
  User.init(
    {
      name: DataTypes.STRING(100),
      email: { type: DataTypes.STRING(100), unique: true, allowNull: true },
      nisn: { type: DataTypes.STRING(20), unique: true, allowNull: true },
      class_id: { type: DataTypes.BIGINT, allowNull: true },
      password: DataTypes.STRING(255),
      role: DataTypes.STRING(20), // 'admin', 'guru', 'siswa'
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
