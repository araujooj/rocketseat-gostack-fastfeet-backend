import Sequelize, { Model } from 'sequelize';

class DeliveryMan extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING /* todos os valores que pode receber */,
        email: Sequelize.STRING,
        avatar_id: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'deliveryman',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }
}

export default DeliveryMan;
