"use strict";

const env = process.env.NODE_ENV || "dev";
const conf = require("../config/config.json")[env];
const Sequelize = require("sequelize");

const sequelize = new Sequelize(conf.db.name, conf.db.user, conf.db.pass, {
  dialect: "postgres",
  host: conf.db.host,
  port: conf.db.port,
  timezone: conf.db.timezone,
  benchmark: true,
  dialectOptions: {
    useUTC: true,
  },
  pool: {
    max: 20,
    min: 0,
    idle: 10000,
  },
  logging: false,
  alter: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.js")(sequelize, Sequelize);
db.tenants = require("./tenants.js")(sequelize, Sequelize);
db.sites = require("./sites.js")(sequelize, Sequelize);
db.user_sites = require("./user_sites.js")(sequelize, Sequelize);
db.notes = require("./notes.js")(sequelize, Sequelize);

sequelize
  .sync()
  .then(() => require("./seed")(db))
  .catch((err) => {
    console.error(err);
  });

module.exports = db;
