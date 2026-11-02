const env = process.env.NODE_ENV || "dev";
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");
const nocache = require("nocache");

const serveSpa =
  process.env.SERVE_SPA === "true" || env === "production" || env === "prod";
const isLocalDev = !serveSpa;

const indexRouter = require("./routes/index");
const apiWebAuthRouter = require("./routes/a_auth");
const apiNoteRouter = require("./routes/a_note");

const app = express();

app.use(nocache());

if (isLocalDev) {
  app.use(cors({ origin: true, credentials: true }));
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
      },
    },
  }),
);
app.use(helmet.permittedCrossDomainPolicies());
app.use(
  helmet.hsts({
    maxAge: 31536000,
  }),
);

app.set("trust proxy", true);

logger.token("body", (req) => JSON.stringify(req.body));
logger.format(
  "customFormat",
  ":method :url :status :response-time ms - :res[content-length] :body",
);
app.use(logger("customFormat"));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/a/auth", apiWebAuthRouter);
app.use("/a/note", apiNoteRouter);

if (serveSpa) {
  const clientDist = path.join(__dirname, "..", "dist", "client");
  app.use(express.static(clientDist));
  app.get("*", function (req, res, next) {
    if (req.path.startsWith("/api") || req.path.startsWith("/a/")) {
      return next();
    }
    const shellPath = path.join(clientDist, "_shell.html");
    const indexPath = path.join(clientDist, "index.html");
    const spaFile = fs.existsSync(shellPath) ? shellPath : indexPath;
    if (fs.existsSync(spaFile)) {
      return res.sendFile(spaFile);
    }
    return next(createError(404, "Frontend build not found. Run npm run build first."));
  });
}

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  if (err.status == 404) {
    if (req.originalUrl.startsWith("/a/") || req.originalUrl.startsWith("/api")) {
      return res.status(404).send("API not found");
    }
    if (serveSpa) {
      return res.status(404).send("Not found");
    }
    return res.status(404).json({ status: "failed", errMsg: "Not found" });
  }

  console.error(err);
  const status = err.status || 500;
  return res.status(status).json({
    status: "failed",
    errMsg:
      req.app.get("env") === "development" ? err.message || "Server error" : "Server error",
  });
});

module.exports = app;
