module.exports = (sequelize, Sequelize) => {
  const Notes = sequelize.define(
    "notes",
    {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
      },
      tenant_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  );
  return Notes;
};
