const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema(
  {
    name: String,
    phone: Number,
    email: String,
    password: String,
    team: Array,
    category: Array,
  },
  { timestamps: true }
);

let Business =
  mongoose.models.businesses || mongoose.model("businesses", BusinessSchema);

module.exports = Business;
