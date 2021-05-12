//defining jobseeker model
const mongoose = require("mongoose");
const JobSeekerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  universityName: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  yearObtained: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  employmentType: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  yearsWorked: {
    type: Number,
    required: true,
  },
  skills: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", JobSeekerSchema);
