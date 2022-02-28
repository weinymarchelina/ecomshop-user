import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

const links = [
  "Store",
  "Cart",
  "Favorite",
  "Transaction",
  "Notification",
  "Account",
];

const Navbar = () => {
  const { data: session } = useSession();
  useState(false);
  const router = useRouter();

  // const [anchorElNav, setAnchorElNav] = useState(null);

  // const handleOpenNavMenu = (event) => {
  //   setAnchorElNav(event.currentTarget);
  // };

  // const handleCloseNavMenu = () => {
  //   setAnchorElNav(null);
  // };

  return (
    <AppBar
      className="nav-container"
      sx={{ px: 2, zIndex: 10 }}
      position="static"
      style={{ position: "fixed" }}
    >
      <Container maxWidth="xxl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            LOGO
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
            }}
          >
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              LOGO
            </Box>

            {session && (
              <Box>
                <IconButton
                  size="large"
                  onClick={() => router.push("/store")}
                  color="inherit"
                >
                  <ShoppingCartIcon />
                </IconButton>
                <IconButton
                  size="large"
                  onClick={() => router.push("/notification")}
                  color="inherit"
                >
                  <NotificationsIcon />
                </IconButton>
                {/* <IconButton
                  size="large"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: "block", md: "none" },
                  }}
                >
                  {links.map((link) => (
                    <MenuItem key={link} onClick={handleCloseNavMenu}>
                      <Link href={`/${link.toLowerCase()}`}>{link}</Link>
                    </MenuItem>
                  ))}
                </Menu> */}
              </Box>
            )}
          </Box>

          {session && (
            <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
              {links.map((link) => (
                <Typography sx={{ paddingLeft: 2 }} key={link}>
                  <Link href={`/${link.toLowerCase()}`}>{link}</Link>
                </Typography>
              ))}
            </Box>
          )}

          {!session && (
            <>
              {/* <Button variant="outlined" color="secondary">
                <Link href="/">Sign Up</Link>
              </Button> */}
              <Button
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
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
