const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderDate: String,
    finishDate: String,
    itemList: Array,
    totalPrice: Number,
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
