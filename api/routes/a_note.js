const express = require("express");
const router = express.Router();
const jwtAuth = require("../common/jwtAuth");
const send = require("../common/sender")["send"];
const biz = require("../business/business.js");

router.get("/list", jwtAuth.checkTokenForApi, async (req, res) => {
  biz.notes.list(req, res);
});

router.post("/create", jwtAuth.checkTokenForApi, async function (req, res) {
  biz.notes.create(req, res);
});

router.get("/o/:id", jwtAuth.checkTokenForApi, async (req, res) => {
  biz.notes.read(req, res);
});

router.post("/update", jwtAuth.checkTokenForApi, async function (req, res) {
  biz.notes.update(req, res);
});

router.post("/delete", jwtAuth.checkTokenForApi, async function (req, res) {
  biz.notes.delete(req, res);
});

router.all("/*", (req, res) => {
  send(res, 404, "API Not Found");
});

module.exports = router;
