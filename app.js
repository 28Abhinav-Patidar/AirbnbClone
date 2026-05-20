const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/Reviews.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const AsyncWrap = require("./utils/Error.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");

const listings = require("./routs/listing.js"); 

const MONGO_URL = "mongodb://127.0.0.1:27017/Airbnb";
main().then(()=>{
    console.log("DB connected")
}).catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended :true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("Namaste");
});
const validatelisting = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
}

app.use("/listing",listings);

const validatereview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
}
app.post("/listing/:id/review",validatereview ,AsyncWrap(async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listing/${id}`);

}))

app.delete("/listing/:id/review/:reviewID",AsyncWrap(async(req,res)=>{
    let {id,reviewID} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull :{reviews :reviewID}});
    await Review.findByIdAndDelete(reviewID);

    res.redirect(`/listing/${id}`);
}))

app.use((req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});

app.use((err, req, res, next) => {
    let {statusCode=500,message="Something went Wrong"} = err;
    // const status = err.status || 500;
    // const message = err.message || "Something went wrong";
    // res.status(status).send(message);
    res.status(statusCode).render("includes/Error" ,{message});
});

app.listen(4000, ()=>{
    console.log("server is running at port 4000");
});