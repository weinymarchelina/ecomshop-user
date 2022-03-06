import dbConnect from "../../../db/database";
import Order from "../../../models/order";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getOrder(req, res);
};

const getOrder = async (req, res) => {
  const businessId = process.env.BUSINESS_ID;
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });
    const { orderId } = req.body;

    const orderData = await Order.findById(orderId);
    const productData = await Product.find({
      businessId: businessId,
    });

    res.status(200).json({
      orderData,
      productData,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
