'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ExerciseAnswers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      attempt_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'ExerciseAttempts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      question_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Questions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      selected_option_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'Options', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      answered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ExerciseAnswers');
  }
};
