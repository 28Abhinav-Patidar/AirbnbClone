const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/Error.js");
const passport = require("passport");
const {saveredirectUrl} = require("../middleware.js");
const userController = require("../Controllers/user.js");
const user = require("../models/user.js");

router.route("/signup")
.get(userController.renderSignupPage)
.post( wrapAsync(userController.signipUser));

router.route("/login")
.get(userController.renderLoginPage)
.post(saveredirectUrl,
    passport.authenticate("local",{failureRedirect : "/login" , failureFlash: true}),userController.loginUser);

router.get("/logout",userController.logoutUser);

module.exports = router;