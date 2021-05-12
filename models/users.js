//defining model
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: false,
  },
  companyUrl: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  universityName: {
    type: String,
    required: false,
  },
  qualification: {
    type: String,
    required: false,
  },
  degree: {
    type: String,
    required: false,
  },
  yearObtained: {
    type: Number,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  employmentType: {
    type: String,
    required: false,
  },
  company: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  yearsWorked: {
    type: Number,
    required: false,
  },
  skills: {
    type: String,
    required: false,
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", userSchema);
