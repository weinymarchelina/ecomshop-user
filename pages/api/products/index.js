import dbConnect from "../../../db/database";
import User from "../../../models/user";
import Business from "../../../models/business";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getProduct(req, res);
};

const getProduct = async (req, res) => {
  const businessId = process.env.BUSINESS_ID;
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });
    const { userId } = session.user;

    const user = await User.findById(userId);
    const business = await Business.findById(businessId);
    const product = await Product.find({
      businessId: businessId,
    });

    let fixError = false;
    const checkBasket = user.basket.map((obj) => {
      const sameProduct = product.filter((item) => {
        // console.log(obj.productId);
        // console.log(item._id);
        return obj.productId === item.id;
      });

      const newCartQty = sameProduct[0].stockQty;

      if (obj.quantity > newCartQty) {
        obj.quantity = newCartQty;
        fixError = true;
      }
      return obj;
    });

    if (fixError) {
      await User.updateOne(
        { _id: userId },
        {
          basket: checkBasket,
        }
      );
      console.log("fixed");
    }

    res.status(200).json({
      businessCategory: business.category,
      productData: product.filter((product) => product.activeStatus),
      userFavList: user.favList,
      userBasket: checkBasket,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
