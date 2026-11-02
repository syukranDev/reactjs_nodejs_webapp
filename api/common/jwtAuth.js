const env = process.env.NODE_ENV || "dev";
const db = require("../model/db.js");
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const conf = require("../config/config.json")[env];
const sq = db.sequelize;

let Auth = {};

const qSelectedTenantSites = `select tenant_id as tenant_id, array_agg(site_id) as allowed_sites
from user_sites
where user_id = :user_id
and (:tenant_id is null or tenant_id = :tenant_id)
group by tenant_id`;

Auth.checkTokenForApi = async function (req, res, next) {
  const token = req.cookies[conf.cookie.tokenName];
  try {
    if (!token) throw "Missing token";
    const decoded = await jwt.verify(token, conf.cookie.secret);

    const user = await db.users.findOne({
      where: { id: { [Op.eq]: decoded.user_id } },
    });
    if (!user) throw `User ${decoded.user_id} not found.`;
    if (user.session_id != decoded.session_id) throw `User ${decoded.user_id} session id not matching.`;
    if (!decoded.tenant_id) throw "User must select a Tenant ID";

    req.token = decoded;

    const sites = await sq.query(qSelectedTenantSites, {
      type: sq.QueryTypes.SELECT,
      replacements: { user_id: user.id, tenant_id: decoded.tenant_id },
      plain: true,
      raw: true,
    });

    if (sites != null) {
      req.token.allowed_sites = sites.allowed_sites;
    }

    return next();
  } catch (e) {
    console.error(e);
    return res.status(401).send({ status: "failed", errMsg: "Unauthorized" });
  }
};

module.exports = Auth;
