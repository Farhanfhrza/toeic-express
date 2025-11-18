'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ExerciseAttempts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      material_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Materials', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      attempt_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      score: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      finished_at: {
        type: Sequelize.DATE,
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ExerciseAttempts');
  }
};
