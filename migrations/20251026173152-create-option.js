"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Options", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      question_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "questions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      label: { // 'A', 'B', 'C', 'D'
        type: Sequelize.CHAR(1),
        allowNull: false
      },
      option_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Options");
  },
};
