const express = require("express");
const router = express.Router({ mergeParams: true });
const {listingSchema,reviewSchema} = require("../schema.js");
const AsyncWrap = require("../utils/Error.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/Reviews.js");
const {isloggedin,isAuthor} = require("../middleware.js");
const reviewController = require("../Controllers/review.js");

const validatereview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
}

router.post("/",isloggedin,validatereview,reviewController.createReview );

router.delete("/:reviewID",isloggedin,isAuthor,reviewController.deleteReview);


module.exports = router;

