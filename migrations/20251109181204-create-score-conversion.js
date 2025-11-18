'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ScoreConversion', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      type: { // 'reading' atau 'listening'
        type: Sequelize.STRING(20),
        allowNull: false
      },
      correct_answers_count: { // Jumlah Jawaban Benar
        type: Sequelize.INTEGER,
        allowNull: false
      },
      converted_score: { // Skor Hasil Konversi
        type: Sequelize.INTEGER,
        allowNull: false
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
    // Menambahkan constraint UNIQUE untuk mencegah duplikasi entri konversi
    await queryInterface.addConstraint('ScoreConversion', {
      fields: ['type', 'correct_answers_count'],
      type: 'unique',
      name: 'unique_score_conversion_type_count'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ScoreConversion');
  }
};
