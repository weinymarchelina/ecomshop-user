const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "user",
    },
    email: String,
    picture: {
      type: String,
      default: null,
    },
    favList: Array,
    basket: Array,
    contactInfo: Object,
    totalOrder: Number,
    totalItem: Number,
    totalPaid: Number,
    favProducts: Array,
    businessId: String,
  },
  { timestamps: true }
);

let User = mongoose.models?.users || mongoose.model("users", UserSchema);

module.exports = User;
