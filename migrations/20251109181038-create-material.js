'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Materials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      menu_category: { // 'reading' atau 'listening'
        type: Sequelize.STRING(20),
        allowNull: false
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      pdf_url: {
        type: Sequelize.TEXT, // URL ke file PDF
        allowNull: true
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      // CATATAN: content_text/image/audio dihapus/digantikan oleh pdf_url
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Materials');
  }
};
