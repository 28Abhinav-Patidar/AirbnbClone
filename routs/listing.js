const express = require("express");
const router = express.Router();
const AsyncWrap = require("../utils/Error.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {listingSchema,reviewSchema} = require("../schema.js");

const validatelisting = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
}

router.get("/",AsyncWrap(async (req,res)=>{
    const allListing = await Listing.find({});
    res.render("listing/index.ejs",{allListing});
}));

router.get("/new",(req,res)=>{
    res.render("listing/new.ejs");
});

router.delete("/:id", AsyncWrap(async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listing");
}));

router.get("/:id",AsyncWrap(async (req,res)=>{
    const {id} = req.params;
    const list = await Listing.findById(id).populate("reviews");
    res.render("listing/list.ejs" , {list});
}));

router.get("/:id/edit",AsyncWrap(async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listing/edit.ejs",{listing});
}));

router.put("/:id/edit", validatelisting, AsyncWrap(async(req,res)=>{

    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }

    const {id} = req.params;

    await Listing.findByIdAndUpdate(id,{...req.body.listing});

    res.redirect(`/listing/${id}`);
}));

router.post("/",validatelisting , async(req,res,next)=>{
    try{
    const {title,description,image,price,location,country} = req.body.listing;
   const newlisting = new Listing({
    title,
    description,
    image,
    price: Number(price),
    location,
    country
});
    await newlisting.save();
    res.redirect("/listing");
    }catch(err){
        next(new ExpressError(401,"Enter valid Price"));
    }
  
});

module.exports = router;