'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      entity_type: { // Untuk Polymorphic Relationship
        type: Sequelize.STRING(20),
        allowNull: false
      },
      entity_id: { // Untuk Polymorphic Relationship
        type: Sequelize.BIGINT,
        allowNull: false
      },
      question_type: { // 'reading' atau 'listening'
        type: Sequelize.STRING(20),
        allowNull: false
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      question_image: {
        type: Sequelize.TEXT, // URL ke gambar
        allowNull: true
      },
      question_audio: {
        type: Sequelize.TEXT, // URL ke audio
        allowNull: true
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
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Questions');
  }
};