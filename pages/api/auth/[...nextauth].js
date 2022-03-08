import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
const User = require("../../../models/user");
import dbConnect from "../../../db/database";

dbConnect();
const businessId = process.env.BUSINESS_ID;
const createOptions = (req, res) => ({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  jwt: {
    encryption: true,
  },
  session: { jwt: true },
  secret: process.env.SECRET,
  database: process.env.DB_STRING,
  theme: {
    colorScheme: "light",
    brandColor: "#202020",
    logo: "/svg-auth.svg",
  },
  session: { jwt: true },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      // checking whether the user is an old or new user
      const oldUser = await User.findOne({ email: token.email });

      if (oldUser) {
        token.userId = oldUser._id;

        return token;
      } else {
        const user = await new User({
          name: token.name,
          email: token.email,
          picture: token.picture,
          businessId,
          totalOrder: 0,
          totalItem: 0,
          totalPaid: 0,
          contactInfo: {
            name: "",
          },
        }).save();
        token.userId = user._id;

        return token;
      }
    },
    async session({ session, token, user }) {
      session.user.userId = token.userId;

      return session;
    },
  },
});

export default async (req, res) => {
  return NextAuth(req, res, createOptions(req, res));
};
