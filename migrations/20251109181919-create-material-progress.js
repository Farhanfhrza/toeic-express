'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MaterialProgress', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      material_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Materials',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_completed: { // Status: true jika sudah selesai dipelajari
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      completed_at: { // Waktu siswa menyelesaikan materi
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

    // Menambahkan constraint UNIQUE pada kombinasi user_id dan material_id
    // Memastikan satu siswa hanya bisa memiliki satu baris progres per materi.
    await queryInterface.addConstraint('MaterialProgress', {
      fields: ['user_id', 'material_id'],
      type: 'unique',
      name: 'unique_user_material_progress'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MaterialProgress');
  }
};
