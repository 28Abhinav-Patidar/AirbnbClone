const path = require("path");

const controllerPath = require.resolve("../controllers/ai");

const aiController = require("../controllers/ai");

const express = require("express");
const router = express.Router();

router.post("/generate-description", aiController.generateDescription);

module.exports = router;