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
    phone: Number,
    favList: Array,
    orders: Array,
    basket: Array,
    contactName: String,
    totalOrder: Number,
    totalItem: Number,
    totalPaid: Number,
    favProducts: Array,
  },
  { timestamps: true }
);

let User = mongoose.models?.users || mongoose.model("users", UserSchema);

module.exports = User;
