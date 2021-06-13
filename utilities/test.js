//Imports
require("dotenv").config();
const User = require("../models/users");
const Job = require("../models/jobs");
const mongoose = require("mongoose");

mongoose.connect( "mongodb://localhost:27017/motionresume", {
    useNewParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", (error) => {
    console.log(error);
  });
  
  db.once("open", () => {
    console.log("Connected to the database!");
  });

  Job.deleteOne({_id : "60c52608f77be3409ccd91e7"}, function (err, data) {
    if(err) {
      console.log("Error in deleting job")
    }
    else {
      console.log(data)
      console.log("Successfully deleted job")
    }
  })

  // User.deleteOne({email : "fezekileplaatyi@myplusplus.com"}, function (err, data) {
  //     if(err) {
  //         console.log("Error in deleting user")
  //     }
  //     else{
  //       console.log(data)
  //         console.log("Successfully deleted")
  //     }
  // })

  