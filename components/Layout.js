import Navbar from "./Navbar";
import Head from "next/head";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
  const [value, setValue] = useState(null);
  const matches = useMediaQuery("(max-width:900px)");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (router.route.includes("store")) {
      setValue(0);
    } else if (router.route.includes("favorite")) {
      setValue(1);
    } else if (router.route.includes("transaction")) {
      setValue(2);
    } else if (router.route.includes("account")) {
      setValue(3);
    }
  }, []);

  return (
    <div className="content">
      <Head>
        <title>Ecomshop | E-Commerce Website</title>
        <meta
          name="description"
          content="User site for your ecommerce website"
        />
        <link rel="icon" href="/icon.png" />{" "}
      </Head>
      <Navbar />
      {children}
      {session && matches && (
        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999 }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
              switch (newValue) {
                case 1:
                  router.push("/favorite");
                  break;
                case 2:
                  router.push("/transaction");
                  break;
                case 3:
                  router.push("/account");
                  break;

                default:
                  router.push("/store");
                  break;
              }
            }}
          >
            <BottomNavigationAction label="Store" icon={<StorefrontIcon />} />
            <BottomNavigationAction label="Favorite" icon={<FavoriteIcon />} />

            <BottomNavigationAction
              label="Transaction"
              icon={<ReceiptIcon />}
            />

            <BottomNavigationAction
              label="Account"
              icon={<AccountCircleIcon />}
            />
          </BottomNavigation>
        </Paper>
      )}
    </div>
  );
};

export default Layout;
