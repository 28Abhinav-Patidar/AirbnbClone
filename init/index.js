const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Airbnb";
main().then(()=>{
    console.log("DB connected")
}).catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
};

const initDb = async () =>{
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({
        ...obj,owner : "6a4baa16956cb79fb7673511"
    }))
    await Listing.insertMany(initdata.data);

    console.log("Data initilized");

}

initDb();