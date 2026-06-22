const mongoose=require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("Connected to database"))
    .catch((err)=>{
        console.log("DB connection failed");
        console.error(err);
        process.exit(1);
    })
};