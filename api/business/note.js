const { v4: uuidv4 } = require("uuid");
const db = require("../model/db.js");
const Op = db.Sequelize.Op;
const limit = 20;

const Notes = {};

Notes.list = async function (req, res) {
  const { tenant_id } = req.token;
  let page = req.query.page;
  const keyword = req.query.keyword;
  let limitRows = req.query.limit_rows;

  limitRows = isNaN(limitRows) || !limitRows ? limit : parseInt(limitRows, 10);
  page = !page || isNaN(page) || parseInt(page, 10) < 0 ? 0 : parseInt(page, 10) - 1;
  const offset = page * limitRows;

  const where = {
    tenant_id: { [Op.eq]: tenant_id },
  };
  if (keyword) {
    where.title = { [Op.iLike]: `%${keyword}%` };
  }

  try {
    const notes = await db.notes.findAndCountAll({
      attributes: ["id", "tenant_id", "title", "body", "created_by", "created_at"],
      order: [["created_at", "DESC"]],
      where,
      offset,
      limit: limitRows,
      raw: true,
    });
    notes.limit = limitRows;
    notes.offset = offset;
    return res.send({ status: "success", notes });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ status: "failed", errMsg: "Failed to get notes." });
  }
};

Notes.create = async function (req, res) {
  const { user_id, tenant_id } = req.token;
  const title = (req.body.title || "").trim();
  const body = req.body.body || null;

  if (!title) {
    return res.status(422).send({ status: "failed", errMsg: "Title is required." });
  }

  try {
    const note = await db.notes.create({
      id: uuidv4(),
      tenant_id,
      title,
      body,
      created_by: user_id,
    });
    return res.send({ status: "success", note });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ status: "failed", errMsg: "Failed to create note." });
  }
};

Notes.read = async function (req, res) {
  const { tenant_id } = req.token;
  try {
    const note = await db.notes.findOne({
      where: {
        id: { [Op.eq]: req.params.id },
        tenant_id: { [Op.eq]: tenant_id },
      },
      raw: true,
    });
    if (!note) {
      return res.status(404).send({ status: "failed", errMsg: "Note not found." });
    }
    return res.send({ status: "success", note });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ status: "failed", errMsg: "Failed to get note." });
  }
};

Notes.update = async function (req, res) {
  const { tenant_id } = req.token;
  const title = (req.body.title || "").trim();
  if (!req.body.id || !title) {
    return res.status(422).send({ status: "failed", errMsg: "Id and title are required." });
  }

  try {
    const [count] = await db.notes.update(
      { title, body: req.body.body || null },
      {
        where: {
          id: { [Op.eq]: req.body.id },
          tenant_id: { [Op.eq]: tenant_id },
        },
      },
    );
    if (!count) {
      return res.status(404).send({ status: "failed", errMsg: "Note not found." });
    }
    return res.send({ status: "success" });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ status: "failed", errMsg: "Failed to update note." });
  }
};

Notes.delete = async function (req, res) {
  const { tenant_id } = req.token;
  if (!req.body.id) {
    return res.status(422).send({ status: "failed", errMsg: "Id is required." });
  }

  try {
    const count = await db.notes.destroy({
      where: {
        id: { [Op.eq]: req.body.id },
        tenant_id: { [Op.eq]: tenant_id },
      },
    });
    if (!count) {
      return res.status(404).send({ status: "failed", errMsg: "Note not found." });
    }
    return res.send({ status: "success" });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ status: "failed", errMsg: "Failed to delete note." });
  }
};

module.exports = Notes;
