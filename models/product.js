const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    category: Object,
    desc: String,
    image: Array,
    stockQty: Number,
    warningQty: Number,
    activeStatus: Boolean,
    price: Array,
    businessId: String,
    soldQty: Number,
  },
  { timestamps: true }
);

let Product =
  mongoose.models.products || mongoose.model("products", ProductSchema);

module.exports = Product;
