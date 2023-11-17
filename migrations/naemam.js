'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('InventorySnapshots', {
      fields: ['itemId'],
      type: 'foreign key',
      name: 'custom_fk_constraint_name', // 원하는 이름으로 설정
      references: {
        table: 'items',
        field: 'item_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 이전 마이그레이션 롤백 작업 정의 (필요한 경우)
  },
};