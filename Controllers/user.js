const User = require("../models/user");

module.exports.renderSignupPage = (req, res) => {
    res.render("user/signup.ejs");
};

module.exports.signipUser = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newuser = new User({ username, email });
        const registeruser = await User.register(newuser, password);
        req.login(registeruser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "User registered successfully");
            res.redirect("/listing");
        })
    }
    catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }

};

module.exports.renderLoginPage = (req, res) => {
    res.render("user/login");
};

module.exports.loginUser = async (req, res) => {
    req.flash("success", "Logged in Successfully!");
    let redirectUrl = res.locals.redirecturl || "/listing";
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "User logged out successfully");
        res.redirect("/listing");
    });
};