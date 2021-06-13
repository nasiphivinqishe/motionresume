//defining model
const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
  poster: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  field: {
    type: String,
    required: true,
  },
  skills: {
    type: String,
    required: true,
  },
  functions: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  application_closing_date: {
    type: Date,
    required: true,
  },
  applicants: {
    type: [Object],
    blackbox: true,
  },
  interview: {
    type: Object,
    blackbox: true,
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("jobs", jobSchema);
