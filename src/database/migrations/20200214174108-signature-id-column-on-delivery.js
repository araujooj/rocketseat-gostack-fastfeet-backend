module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('deliveries', 'signature_id', {
    type: Sequelize.INTEGER,
    references: { model: 'files', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    allowNull: true,
  }),

  down: (queryInterface) => queryInterface.removeColumn('deliveries', 'signature_id'),
};
