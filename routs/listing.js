const express = require("express");
const router = express.Router();
const AsyncWrap = require("../utils/Error.js");
const Listing = require("../models/listing.js");
const {isloggedin,isOwner,validatelisting} = require("../middleware.js");
const listingController = require("../Controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router.route("/")
.get(AsyncWrap(listingController.index))
.post(isloggedin, upload.single('listing[image]'),validatelisting, listingController.creatingNewListing );

router.get("/new",isloggedin,listingController.renderAddNewListingPage);

router.route("/:id")
.delete(isloggedin,isOwner,listingController.deletingListing)
.get(listingController.renderList);

router.route("/:id/edit")
.get(isloggedin,isOwner,listingController.renderEditListPage)
.put(isloggedin,isOwner, upload.single('listing[image]'),validatelisting,listingController.editList);

module.exports = router;