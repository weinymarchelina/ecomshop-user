import dbConnect from "../../../db/database";
import User from "../../../models/user";

import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await handleFavorite(req, res);
};

const handleFavorite = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });
    const { userId } = session.user;
    const { productId, favorite } = req.body;

    if (favorite === "Update") {
      const user = await User.updateOne(
        { _id: userId },
        {
          favList: productId,
        }
      );
      return res.status(200).json({
        result: user,
      });
    } else if (!favorite) {
      const user = await User.updateOne(
        { _id: userId },
        {
          $push: {
            favList: productId,
          },
        }
      );
      return res.status(200).json({
        result: user,
      });
    } else {
      const user = await User.updateOne(
        { _id: userId },
        {
          $pull: {
            favList: productId,
          },
        }
      );
      return res.status(200).json({
        result: user,
      });
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
