module.exports = (sequelize, Sequelize) => {
  const Tenants = sequelize.define(
    "tenants",
    {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  );
  return Tenants;
};
