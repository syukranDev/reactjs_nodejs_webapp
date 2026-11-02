const env = process.env.NODE_ENV || "dev";
const conf = require("../config/config.json")[env];
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const db = require("../model/db.js");
const Op = db.Sequelize.Op;
const sq = db.sequelize;

const msgMissingParam = "Please enter username and password";
const msgLoginFailed = "Invalid username or password";
const msgSignFailed = "Failed to sign token";

const qTenantList = `select t.id, t.name
from user_sites us
inner join tenants t
  on t.id = us.tenant_id
where lower(us.user_id) = lower(:user_id)
group by t.id, t.name`;

function cookieOptions() {
  const insecure = env === "local" || env === "dev" || env === "development";
  return {
    httpOnly: true,
    sameSite: insecure ? "lax" : "strict",
    secure: !insecure,
    path: "/",
  };
}

function setAuthCookie(res, token) {
  res.cookie(conf.cookie.tokenName, token, cookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(conf.cookie.tokenName, cookieOptions());
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    active: user.active,
    last_login_at: user.last_login_at,
  };
}

async function loadTenants(userId) {
  return sq.query(qTenantList, {
    type: sq.QueryTypes.SELECT,
    replacements: { user_id: userId },
  });
}

function signToken(payload) {
  return jwt.sign(payload, conf.cookie.secret, { expiresIn: "12h" });
}

async function authPayload(user, tenantId) {
  const tenants = await loadTenants(user.id);
  return {
    status: "success",
    user: publicUser(user),
    session: {
      user_id: user.id,
      role: user.role,
      tenant_id: tenantId,
    },
    tenants,
    needsTenant: !tenantId,
    mustChangePassword: false,
  };
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(422).send({ status: "failed", errMsg: msgMissingParam });
  }

  try {
    const user = await db.users.findOne({
      where: db.Sequelize.where(
        db.Sequelize.fn("lower", db.Sequelize.col("id")),
        sq.fn("lower", username),
      ),
    });
    if (!user || user.active === false) {
      return res.status(401).send({ status: "failed", errMsg: msgLoginFailed });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).send({ status: "failed", errMsg: msgLoginFailed });
    }

    const sessionId = uuidv4();
    user.session_id = sessionId;
    user.last_login_at = new Date();
    await user.save();

    const tenants = await loadTenants(user.id);
    const tenantId = tenants.length === 1 ? tenants[0].id : null;
    let token;
    try {
      token = signToken({
        user_id: user.id,
        role: user.role,
        session_id: sessionId,
        tenant_id: tenantId,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ status: "failed", errMsg: msgSignFailed });
    }

    setAuthCookie(res, token);
    return res.send(await authPayload(user, tenantId));
  } catch (e) {
    console.error(e);
    return res.status(500).send({ status: "failed", errMsg: "Login failed." });
  }
});

router.get("/session", async (req, res) => {
  const token = req.cookies[conf.cookie.tokenName];
  if (!token) {
    return res.status(401).send({ status: "failed", errMsg: "Unauthorized" });
  }

  try {
    const decoded = await jwt.verify(token, conf.cookie.secret);
    const user = await db.users.findOne({
      where: { id: { [Op.eq]: decoded.user_id } },
    });
    if (!user || user.session_id != decoded.session_id) {
      clearAuthCookie(res);
      return res.status(401).send({ status: "failed", errMsg: "Unauthorized" });
    }
    return res.send(await authPayload(user, decoded.tenant_id || null));
  } catch (e) {
    console.error(e);
    clearAuthCookie(res);
    return res.status(401).send({ status: "failed", errMsg: "Unauthorized" });
  }
});

router.post("/tenant", async (req, res) => {
  const token = req.cookies[conf.cookie.tokenName];
  const tenantId = req.body && req.body.tenant_id;
  if (!token || !tenantId) {
    return res.status(422).send({ status: "failed", errMsg: "Tenant is required." });
  }

  try {
    const decoded = await jwt.verify(token, conf.cookie.secret);
    const user = await db.users.findOne({
      where: { id: { [Op.eq]: decoded.user_id } },
    });
    if (!user || user.session_id != decoded.session_id) {
      return res.status(401).send({ status: "failed", errMsg: "Unauthorized" });
    }

    const allowed = await sq.query(
      `select tenant_id
       from user_sites
       where user_id = :user_id
         and tenant_id = :tenant_id
       group by tenant_id`,
      {
        type: sq.QueryTypes.SELECT,
        replacements: { user_id: user.id, tenant_id: tenantId },
        plain: true,
      },
    );
    if (!allowed) {
      return res.status(403).send({ status: "failed", errMsg: "Tenant is not assigned to this user." });
    }

    const nextToken = signToken({
      user_id: user.id,
      role: user.role,
      session_id: user.session_id,
      tenant_id: tenantId,
    });
    setAuthCookie(res, nextToken);
    return res.send(await authPayload(user, tenantId));
  } catch (e) {
    console.error(e);
    return res.status(401).send({ status: "failed", errMsg: "Unauthorized" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies[conf.cookie.tokenName];
  try {
    if (token) {
      const decoded = jwt.verify(token, conf.cookie.secret);
      await db.users.update(
        { session_id: null },
        { where: { id: { [Op.eq]: decoded.user_id } } },
      );
    }
  } catch (e) {
    console.error(e);
  }
  clearAuthCookie(res);
  return res.send({ status: "success" });
});

module.exports = router;
