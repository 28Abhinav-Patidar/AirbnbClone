const path = require("path");

const controllerPath = require.resolve("../Controllers/ai");

const aiController = require("../Controllers/ai");

const express = require("express");
const router = express.Router();

router.post("/generate-description", aiController.generateDescription);

module.exports = router;