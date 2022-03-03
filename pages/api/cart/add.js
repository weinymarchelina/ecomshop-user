import dbConnect from "../../../db/database";
import User from "../../../models/user";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await addCart(req, res);
};

const addCart = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });
    const { userId } = session.user;
    const { price, quantity, productId, added, priceList, basket } = req.body;

    if (added === "Update") {
      await User.updateOne(
        { _id: userId },
        {
          basket: basket,
        }
      );
    } else {
      const basketObj = {
        price,
        quantity,
        productId,
      };

      const userData = await User.findById(userId);
      const sameProduct = userData.basket.filter(
        (item) => item.productId === productId
      );

      const getPrice = (currentQty) => {
        if (priceList.length === 1) {
          return priceList[0];
        }

        const rules = priceList.reduce((a, b) => {
          return Math.abs(b.minOrder - currentQty) <
            Math.abs(a.minOrder - currentQty)
            ? b.minOrder
            : a.minOrder;
        });

        const priceCheck = priceList
          .map((path, i, arr) => {
            if (path.minOrder === rules) {
              if (rules <= currentQty) {
                return path;
              } else {
                const prevPath = i - 1;
                return arr[prevPath];
              }
            }
          })
          .find((obj) => obj);

        return priceCheck;
      };

      if (sameProduct[0] && !added) {
        basketObj.quantity = basketObj.quantity + sameProduct[0].quantity;

        const newPrice = getPrice(basketObj.quantity);
        basketObj.price = newPrice.price;

        console.log(basketObj);

        await User.updateOne(
          { _id: userId, "basket.productId": productId },
          {
            $set: {
              "basket.$.quantity": basketObj.quantity,
              "basket.$.price": newPrice.price,
            },
          }
        );
      } else if (!sameProduct[0] && !added) {
        await User.updateOne(
          { _id: userId },
          {
            $push: {
              basket: basketObj,
            },
          }
        );
      }
    }

    const newUpdatedUser = await User.findById(userId);
    console.log(newUpdatedUser.basket);

    return res.status(200).json({
      result: newUpdatedUser,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
