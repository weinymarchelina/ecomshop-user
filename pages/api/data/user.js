import dbConnect from "../../../db/database";
import User from "../../../models/user";
import Product from "../../../models/product";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getUser(req, res);
};

const getUser = async (req, res) => {
  const businessId = process.env.BUSINESS_ID;
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { userId } = session.user;
    const user = await User.findById(userId);
    const products = await Product.find({ businessId });
    const orders = await Order.find({ customerId: userId });

    const favItems = products.map((product) => {
      let buyedQty = 0;
      let amount = 0;

      for (const order of orders) {
        for (const item of order.itemList) {
          if (
            item.productId === product.id &&
            order.doneStatus &&
            order.finishDate !== "-"
          ) {
            buyedQty = buyedQty += item.quantity;
            amount = amount += item.quantity * item.price;
          }
        }
      }

      return {
        productId: product._id,
        name: product.name,
        image: product.image,
        stockQty: product.stockQty,
        buyedQty,
        amount,
      };
    });
    favItems.sort((a, b) => b.buyedQty - a.buyedQty);
    const topItems = favItems
      .filter((product) => product.buyedQty > 0)
      .slice(0, 10);

    res.status(200).json({
      user,
      topItems,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
