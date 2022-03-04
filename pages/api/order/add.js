import dbConnect from "../../../db/database";
import User from "../../../models/user";
import Product from "../../../models/product";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await addOrder(req, res);
};

const addOrder = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { userId } = session.user;
    const { newOrder, prevPath } = req.body;

    const order = await new Order(newOrder).save();
    // console.log("Order: ");
    console.log(order);

    // console.log(prevPath);

    for (const item of newOrder.itemList) {
      const product = await Product.findOne({
        _id: item.productId,
      });
      // console.log(product);
      // console.log(product.stockQty);
      await Product.updateOne(
        { _id: item.productId },
        {
          stockQty: product.stockQty - item.quantity,
        }
      );
      // console.log(product.stockQty - item.quantity);
    }

    if (prevPath === "cart") {
      const user = await User.findById(userId);
      // console.log("Basket");
      // console.log(user.basket);

      const orderIds = newOrder.itemList.map((item) => item.productId);
      // console.log("Order Id");
      // console.log(orderIds);

      const newBasket = user.basket.filter(
        (item) => !orderIds.includes(item.productId)
      );

      // console.log(newBasket);

      await User.updateOne(
        { _id: userId },
        {
          basket: newBasket,
        }
      );
    }

    res.status(200).json({
      msg: `New order!`,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
