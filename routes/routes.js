const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/users");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// Authentication and Authorization Middleware
var auth = function (req, res, next) {
  if (req.session && req.session.userId && req.session.isLoggedIn)
    return next();
  else return res.send("You are not authorized");
};

router.get("/", (req, res) => {
  if (req.session && req.session.userId && req.session.isLoggedIn)
    res.redirect("motion_resume");
  else res.render("index");
});

router.get("/registration", (req, res) => {
  res.render("registration");
});

router.get("/motion_resume", auth, (req, res) => {
  res.render("motion_resume");
});

router.get("/registration_next_recruiter", (req, res) => {
  res.render("registration_recruiter");
});

router.get("/registration_next_jobseeker", (req, res) => {
  res.render("registration_jobseeker");
});

router.post("/register_recruiter", (req, res) => {
  var userData = req.body.userDataObject;
  console.log(userData);

  const user = new User({
    name: userData.name,
    email: userData.companyEmail,
    phone: userData.phone,
    password: userData.password,
    companyName: userData.companyName,
    companyUrl: req.body.userDataObject.companyUrl,
  });
  user.save((err) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      console.log("success");
      res.send("success");
    }
  });
});

// Finding user by email
router.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  console.log(email);
  console.log(password);

  User.findOne({ email: email }, function (err, userResults) {
    if (err) {
      console.log("Error", error);
      res.send("Error in finding email.");
    } else {
      console.log(userResults);
      if (userResults != null) {
        if (password === userResults.password) {
          req.session.userId = userResults._id;
          req.session.isLoggedIn = true;
          res.redirect("motion_resume");
        }
      } else {
        console.log("The user doesnt exist");
        res.send("The user doesnt exist");
      }
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.post("/register_jobseeker", (req, res) => {
  var userData = req.body.userDataObject;
  console.log("****************Show User*****************************");
  console.log(userData);
  console.log("******************Thank you!***************************");

  const user = new User({
    name: userData.name,
    email: userData.companyEmail,
    phone: userData.phone,
    password: userData.password,
    universityName: userData.universityName,
    qualification: userData.qualification,
    degree: userData.degree,
    yearObtained: userData.yearObtained,
    title: userData.title,
    employmentType: userData.employmentType,
    company: userData.company,
    location: userData.location,
    yearsWorked: userData.yearsWorked,
    skills: userData.skills,
  });
  user.save((err) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      console.log("success");
      res.send("success");
    }
  });
});

module.exports = router;
