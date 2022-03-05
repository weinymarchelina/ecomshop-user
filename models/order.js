const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    finishDate: String,
    itemList: Array,
    totalPrice: Number,
    totalQty: Number,
    paymentMethod: String,
    customerName: String,
    customerId: String,
    doneStatus: Boolean,
    note: String,
  },
  { timestamps: true }
);

let Order = mongoose.models.orders || mongoose.model("orders", OrderSchema);

module.exports = Order;
