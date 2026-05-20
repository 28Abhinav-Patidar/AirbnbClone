const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./Reviews.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,

  image: {
    filename: String,
    url: {
    type: String,
    default: "https://i.ytimg.com/vi/J8s38BvX6iU/maxresdefault.jpg",
    set: (v) =>
      v === ""
        ? "https://i.ytimg.com/vi/J8s38BvX6iU/maxresdefault.jpg"
        : v
  }},

  price: Number,
  location: String,
  country: String,

  reviews:[{
    type : Schema.Types.ObjectId,
    ref :"Reviews",
  }]
});

listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;