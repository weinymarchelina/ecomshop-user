import dbConnect from "../../../db/database";
import User from "../../../models/user";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await updateCart(req, res);
};

const getPrice = (currentQty, selectedProduct = product, empty) => {
  if (selectedProduct.price.length === 1) {
    return selectedProduct.price[0];
  }

  const rules = selectedProduct.price.reduce((a, b) => {
    return Math.abs(b.minOrder - currentQty) < Math.abs(a.minOrder - currentQty)
      ? b
      : a;
  });

  const priceCheck = selectedProduct.price
    .map((path, i, arr) => {
      if (path.minOrder === rules.minOrder) {
        if (rules.minOrder <= currentQty) {
          return path;
        } else {
          const prevPath = i - 1;
          return arr[prevPath];
        }
      } else {
        empty = true;
        return rules;
      }
    })
    .find((obj) => obj);

  return priceCheck;
};

const updateCart = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });
    const { userId } = session.user;
    const { inactiveItems } = req.body;

    const user = await User.findById(userId);

    let empty = false;

    const updatedBasket = user.basket.map((obj) => {
      inactiveItems.forEach((product) => {
        if (product._id === obj.productId) {
          obj.quantity = product.stockQty === 0 ? 1 : product.stockQty;
          obj.price = getPrice(product.stockQty, product, empty).price;
        }
      });

      return obj;
    });

    await User.updateOne(
      { _id: userId },
      {
        basket: updatedBasket,
      }
    );

    return res.status(200).json({
      newSelected: updatedBasket,
      empty,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
