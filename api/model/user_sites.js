module.exports = (sequelize, Sequelize) => {
  const UserSites = sequelize.define(
    "user_sites",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tenant_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      site_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  );
  return UserSites;
};
