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
    const { userId } = session.user;

    const order = await Order.find({
      customerId: userId,
    }).sort({ _id: -1 });

    const product = await Product.find({
      businessId,
    });

    res.status(200).json({
      orderData: order,
      productData: product.filter((product) => product.activeStatus),
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
