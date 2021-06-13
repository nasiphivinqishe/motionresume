//defining model
const mongoose = require("mongoose");
const applicantsSchema = new mongoose.Schema({
  applicants: { type: [Object], blackbox: true },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("applicants", applicantsSchema);
