const Listing = require("../models/listing");
const Review = require("../models/Reviews.js");
const AsyncWrap = require("../utils/Error.js");


module.exports.createReview = AsyncWrap(async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; 

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","Review Created")
    res.redirect(`/listing/${id}`);

});

module.exports.deleteReview = AsyncWrap(async(req,res)=>{
    let {id,reviewID} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull :{reviews :reviewID}});
    await Review.findByIdAndDelete(reviewID);
     req.flash("success","Review Deleted")

    res.redirect(`/listing/${id}`);
});