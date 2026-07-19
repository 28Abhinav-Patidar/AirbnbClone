const { number } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema ({
    Comment : String,
    Rating : {
        type : Number,
        min:1,
        max:5
    },
    Created_at : {
        type : Date,
        default:Date.now
    },
    author : {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

})

module.exports = mongoose.model("Reviews",reviewSchema);