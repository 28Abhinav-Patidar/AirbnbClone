
const express = require("express");
const router = express.Router();

const aiController = require("../Controllers/ai");


router.post("/generate-description", aiController.generateDescription);
router.post("/search", aiController.searchListings);

module.exports = router;