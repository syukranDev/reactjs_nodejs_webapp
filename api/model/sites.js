module.exports = (sequelize, Sequelize) => {
  const Sites = sequelize.define(
    "sites",
    {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
      },
      tenant_id: {
        type: Sequelize.TEXT,
        allowNull: false,
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
  return Sites;
};
