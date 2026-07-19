const Listing = require("../models/listing");
const AsyncWrap = require("../utils/Error.js");

module.exports.index = async (req,res)=>{
    const allListing = await Listing.find({});
    res.render("listing/index.ejs",{allListing});
};

module.exports.renderAddNewListingPage = (req,res)=>{
    res.render("listing/new.ejs");
};

module.exports.creatingNewListing = async (req, res, next) => {
    try {
        const { title, description,price, location, country } = req.body.listing;
        let url = req.file.path;
        let filename = req.file.filename;
        const newlisting = new Listing({
            title,
            description,
            image:{url,filename},
            price: Number(price),
            location,
            country
        });
        newlisting.owner = req.user._id;
        await newlisting.save();

        req.flash("success", "New listing created Successfully!");

        res.redirect("/listing");
    } catch (err) {
        next(new ExpressError(401, "Enter valid Price"));
    }
};


module.exports.deletingListing = AsyncWrap(async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully!");
    res.redirect("/listing");
});

module.exports.renderList = AsyncWrap(async (req,res)=>{
    const {id} = req.params;
    const list = await Listing.findById(id).populate({path: "reviews",populate: {path: "author",},}).populate("owner");
     if(!list){
        req.flash("error","listing not found");
       return res.redirect("/listing");
    }
    res.render("listing/list.ejs" , {list});
});

module.exports.renderEditListPage = AsyncWrap(async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","listing not found");
        return res.redirect("/listing");
    }
    let originalURL = listing.image.url;
    originalURL = originalURL.replace("/upload" , "/upload/h_200,w_250");
    res.render("listing/edit.ejs",{listing,originalURL});
});

module.exports.editList = AsyncWrap(async(req,res)=>{

    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }

    const {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
     req.flash("success", "listing edited Successfully!");

    res.redirect(`/listing/${id}`);
});