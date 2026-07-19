const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/Reviews.js");

const { listingSchema } = require("./schema.js");

module.exports.isloggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirecturl = req.originalUrl;
        req.flash("error", "You must be logged in before editing this listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveredirectUrl = (req, res, next) => {
    if (req.session.redirecturl) {
        res.locals.redirecturl = req.session.redirecturl;
    }
    next()
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);

    if (!res.locals.currUser._id.equals(listing.owner._id)) {
        req.flash("error", "you dont have the permission for this listing")
        return res.redirect(`/listing/${id}`);
    }
    next()

}

module.exports.validatelisting = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id, reviewID } = req.params;
    let review = await Review.findById(reviewID);

    if (!res.locals.currUser._id.equals(review.author._id)) {
        req.flash("error", "you dont have the permission for this review")
        return res.redirect(`/listing/${id}`);
    }
    next()

}
