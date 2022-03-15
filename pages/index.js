import { getSession, signIn } from "next-auth/react";

import {
  Button,
  Box,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function Home({ user }) {
  const matches = useMediaQuery("(max-width:500px)");

  return (
    <Container
      className="flex-row "
      sx={{
        pt: 12,
        pb: 5,
      }}
      maxWidth={"md"}
    >
      {!user && (
        <Card variant="outlined" sx={{ width: "100%" }}>
          <CardContent sx={{ p: 5, textAlign: "center" }} className="f-column">
            <Typography
              sx={{
                lineHeight: `${matches ? "150%" : "110%"}`,
                mb: 3,
                width: "35ch",
              }}
              className="main-title"
              variant={matches ? "h6" : "h4"}
              component="h1"
              gutterBottom
            >
              Login Page
            </Typography>

            <Typography
              sx={{ lineHeight: "125%", width: `${matches ? "auto" : "45ch"}` }}
              variant={matches ? "p" : "h6"}
              component="p"
              gutterBottom
            >{`Login to Ecomshop!`}</Typography>

            <img
              className="svg-login"
              src={matches ? "/svg-login-phone.svg" : "/svg-login-pc.svg"}
              alt="login-set-role-img"
            />

            <Box
              className={matches ? "f-column" : "f-row"}
              sx={{ width: `${matches ? "100%" : "auto"}` }}
            >
              <Button
                variant="contained"
                size={matches ? "small" : "large"}
                sx={{ width: `${matches ? "100%" : "auto"}` }}
                onClick={() => {
                  signIn(null, {
                    callbackUrl: `${window.location.origin}/store`,
                  });
                }}
              >
                Login with Google
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      props: { user: null },
    };
  }

  if (session) {
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
