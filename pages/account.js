import { getSession, signOut } from "next-auth/react";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Box,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

const formatter = new Intl.NumberFormat("id", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const Settings = ({ user }) => {
  const [userInfo, setUserInfo] = useState("");

  const matches = useMediaQuery("(max-width:720px)");

  useEffect(async () => {
    try {
      const res = await axios.get("/api/data/user");
      const { user } = res.data;
      console.log(user);
      setUserInfo(user);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  return (
    <Container
      sx={{
        pb: 5,
        pt: 12,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      <Typography
        className="main-title"
        variant="h4"
        component="h1"
        sx={{ mb: 3 }}
        textAlign={matches ? "center" : "left"}
        gutterBottom
      >
        Settings
      </Typography>
      <Card className="f-row" variant="outlined" size="small" sx={{ p: 3 }}>
        <CardContent
          className={matches ? "f-column" : "f-row"}
          sx={{ px: 5, width: "100%" }}
        >
          <Box sx={{ mr: `${matches ? 0 : 2}` }}>
            <Typography
              className="main-title"
              variant="h5"
              component="h2"
              sx={{ mb: 3 }}
              noWrap
              gutterBottom
            >
              Personal Info{" "}
            </Typography>
            <Avatar
              sx={{ width: "100%", height: "100%" }}
              src={user.image}
              alt={`${user.name}'s profile picture`}
            />
          </Box>
          <Box
            className="f-col"
            sx={{
              marginLeft: `${matches ? "0" : "3rem"}`,
              flex: 1,
              alignSelf: `${matches ? "center" : "flex-end"}`,
              mt: 5,
            }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "text.secondary",
                px: 1,
                pb: 1,
                mb: 3,
              }}
              className={matches ? "f-col" : "f-space"}
            >
              <Typography sx={{ fontWeight: 600 }}>Name</Typography>
              <Typography>{user.name}</Typography>
            </Box>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "text.secondary",
                px: 1,
                pb: 1,
                mb: 3,
              }}
              className={matches ? "f-col" : "f-space"}
            >
              <Typography sx={{ fontWeight: 600 }}>Email</Typography>
              <Typography>{user.email}</Typography>
            </Box>
            <Button
              sx={{ px: 2, alignSelf: `${matches ? "none" : "flex-end"}` }}
              variant="contained"
              onClick={() => {
                signOut({ callbackUrl: `${window.location.origin}/` });
              }}
            >
              Sign Out
            </Button>
          </Box>
        </CardContent>
      </Card>

      {userInfo && (
        <Card
          className="f-row"
          variant="outlined"
          size="small"
          sx={{ p: 3, my: 5 }}
        >
          <CardContent
            sx={{
              padding: `${matches ? "0 1rem" : "0 2rem"}`,
              width: "100%",
            }}
          >
            <Box
              className="f-space"
              sx={{
                mt: 2,
                flex: 1,
                alignItems: "center",
              }}
            >
              <Typography className="main-title" variant="h5" component="h2">
                Other Info
              </Typography>
            </Box>
            <Box
              className="f-col"
              sx={{
                flex: 1,
                alignSelf: `${matches ? "center" : "flex-end"}`,
                mt: 5,
              }}
            >
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "text.secondary",
                  px: 1,
                  pb: 1,
                  mb: 3,
                }}
                className={matches ? "f-col" : "f-space"}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  Total Transactions
                </Typography>
                <Typography>{userInfo.totalOrder}</Typography>
              </Box>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "text.secondary",
                  px: 1,
                  pb: 1,
                  mb: 3,
                }}
                className={matches ? "f-col" : "f-space"}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  Total Bought Items
                </Typography>
                <Typography>{userInfo.totalItem}</Typography>
              </Box>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "text.secondary",
                  px: 1,
                  pb: 1,
                  mb: 3,
                }}
                className={matches ? "f-col" : "f-space"}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  Total Transactions Amount
                </Typography>
                <Typography>{formatter.format(userInfo.totalPaid)}</Typography>
              </Box>
              {userInfo.favProducts.length > 0 && (
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "text.secondary",
                    px: 1,
                    pb: 1,
                    mb: 3,
                  }}
                  className={matches ? "f-col" : "f-space"}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    Favorite Products
                  </Typography>
                  {/* <Box>
                    <List>
                      {userInfo.favProducts
                        .map((product) => {
                          return (
                            //
                          );
                        })}
                    </List>
                  </Box> */}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Settings;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/store",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
