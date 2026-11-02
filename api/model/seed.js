const bcrypt = require("bcrypt");

const env = process.env.NODE_ENV || "dev";
const conf = require("../config/config.json")[env];

// First empty database gets admin / admin123 on the default tenant.
module.exports = async function seed(db) {
  const existing = await db.users.count();
  if (existing > 0) return;

  const password = await bcrypt.hash("admin123", conf.saltRounds || 10);

  await db.tenants.create({ id: "default", name: "Default", active: true });
  await db.sites.create({ id: "HQ", tenant_id: "default", name: "Head Office", active: true });
  await db.users.create({
    id: "admin",
    password,
    role: "admin",
    name: "Administrator",
    email: null,
    active: true,
  });
  await db.user_sites.create({
    user_id: "admin",
    tenant_id: "default",
    site_id: "HQ",
  });
};
