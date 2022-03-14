import { Card, CardContent, Container, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function NotFound() {
  const matches = useMediaQuery("(max-width:500px)");
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 3000);
  }, []);

  return (
    <Container
      className="flex-row "
      sx={{
        pt: 12,
        pb: 5,
      }}
      maxWidth={"md"}
    >
      <Card variant="outlined" sx={{ width: "100%" }}>
        <CardContent sx={{ p: 5, textAlign: "center" }} className="f-column">
          <Typography
            sx={{
              mb: 3,
            }}
            className="main-title"
            variant={matches ? "h6" : "h4"}
            component="p"
            gutterBottom
          >
            Page Not Found
          </Typography>
          <Typography
            sx={{ lineHeight: "125%", width: `${matches ? "auto" : "45ch"}` }}
            variant={matches ? "p" : "h6"}
            component="p"
            gutterBottom
          >
            Redirecting you to the main page in 3 seconds...
          </Typography>
          <img
            className="svg-login"
            src="/svg-notfound.svg"
            alt="svg-not-found"
          />
        </CardContent>
      </Card>
    </Container>
  );
}
