'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Option.belongsTo(models.Question, { foreignKey: 'question_id' });
    }
  }
  Option.init({
    question_id: DataTypes.BIGINT,
    label: DataTypes.STRING,
    option_text: DataTypes.TEXT,
    is_correct: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Option',
  });
  return Option;
};