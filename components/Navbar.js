import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  IconButton,
  Button,
  Typography,
} from "@mui/material";

const links = ["Store", "Favorite", "Cart", "Transaction", "Account"];

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <AppBar
      className="nav-container"
      sx={{ px: 2, zIndex: 100 }}
      position="static"
      style={{ position: "fixed" }}
    >
      <Container maxWidth="xxl">
        <Toolbar className="f-space" disableGutters>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: { xs: "30px" },
              cursor: "pointer",
              "&:hover": {
                opacity: 0.85,
              },
            }}
            onClick={() => router.push("/order")}
          >
            <img style={{ width: "100%" }} src="/icon.png" />
            <Typography
              sx={{
                letterSpacing: "1.25px",
                display: { xs: "none", sm: "block" },
                ml: 1,
              }}
            >
              ECOMSHOP
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
            }}
          >
            {session && (
              <Box>
                <IconButton
                  size="large"
                  onClick={() => router.push("/cart")}
                  color="inherit"
                >
                  <ShoppingCartIcon />
                </IconButton>
                <IconButton size="large" color="inherit">
                  <a href="https://wa.me/message/PHWP2UJ7Q6PKL1">
                    <img src="/whatsapp-icon.svg" style={{ width: "22px" }} />
                  </a>
                </IconButton>
              </Box>
            )}
          </Box>

          {session && (
            <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
              {links.map((link) => (
                <Typography
                  variant="text"
                  sx={{ paddingLeft: 2, letterSpacing: "1px" }}
                  key={link}
                >
                  <Link href={`/${link.toLowerCase()}`}>
                    {link.toUpperCase()}
                  </Link>
                </Typography>
              ))}
              <Typography
                variant="text"
                sx={{ paddingLeft: 2, letterSpacing: "1px" }}
                key="whatsapp"
              >
                <a href="https://wa.me/message/PHWP2UJ7Q6PKL1">WHATSAPP</a>
              </Typography>
            </Box>
          )}

          {!session && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* <Button
                onClick={() => {
                  signIn(null, {
                    callbackUrl: `${window.location.origin}/store`,
                  });
                }}
                variant="outlined"
                color="secondary"
                sx={{ ml: 2 }}
              >
                Login
              </Button> */}
              <Button variant="outlined" color="secondary">
                <a href="https://wa.me/message/PHWP2UJ7Q6PKL1">WHATSAPP</a>
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
