import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Input,
  FormLabel,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  Grid,
  IconButton,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

const DisplayProduct = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;

  const [quantity, setQuantity] = useState({});
  const [product, setProduct] = useState(null);
  const [allProduct, setAllProduct] = useState([]);
  const [imgPath, setImgPath] = useState([]);
  const stacks = useMediaQuery("(max-width:450px)");
  const matches = useMediaQuery("(max-width:720px)");

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");

      const { productData } = res.data;
      const searched = productData.filter((product) => product._id === id);

      setProduct(searched[0]);
      console.log(searched[0]);
      setAllProduct(productData);
      setImgPath(productData.image);
    } catch (err) {
      console.log(err.response.data.msg);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, []);

  return (
    <Container
      sx={{
        pt: 12,
        pb: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      <Card className="f-row" variant="outlined" size="small" sx={{ p: 3 }}>
        <CardContent
          className="f-col"
          sx={{
            px: 1,
            width: "100%",
          }}
        >
          <Box
            className="f-col"
            sx={{
              mt: 2,
              mb: 3,
              flex: 1,
              alignItems: "center",
            }}
          >
            <Typography className="main-title" variant="h5" component="h2">
              Product Information
            </Typography>
            {product && (
              <Grid
                container
                className={matches ? "f-column" : "f-row"}
                sx={{
                  gap: 5,
                  my: 7,
                  minHeight: `${matches ? "auto" : "calc(17.5rem + 5vw)"}`,
                }}
              >
                <Grid
                  item
                  xs={12}
                  md={4}
                  // className="f-col"

                  sx={{
                    // alignItems: "stretch",

                    flex: 1,
                    // height: `${matches ? "auto" : "calc(15rem + 5vw)"}`,
                    // width: `${matches ? "100%" : "calc(20rem + 5vw)"}`,
                  }}
                >
                  <Box>
                    <img
                      sx={{
                        height: `${matches ? "auto" : "calc(15rem + 5vw)"}`,
                      }}
                      style={{ objectFit: "center" }}
                      src={product.image[0]}
                    />
                  </Box>
                  <Box className="f-row" style={{ alignItems: "flex-start" }}>
                    {product.image.map((img) => (
                      <Box sx={{ flex: 1 }}>
                        <img style={{ objectFit: "center" }} src={img} />
                      </Box>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={7} sx={{ flex: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant={matches ? "subtitle1" : "text"}
                      component="p"
                    >
                      {product.category?.name}
                    </Typography>
                    <Typography variant={matches ? "h6" : "h5"} component="h2">
                      {product.name}
                    </Typography>
                    <Typography variant={matches ? "h6" : "h5"} component="p">
                      {formatter.format(product.price[0].price)}
                    </Typography>
                  </Box>
                  <Box
                    className="f-col"
                    sx={{
                      flex: 1,
                      mx: 0,
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Box>
                      <InputLabel>
                        <Typography variant={matches ? "text" : "h6"}>
                          Quantity
                        </Typography>
                      </InputLabel>
                      <Box
                        className="f-row"
                        sx={{
                          flex: 1,
                          mx: 0,
                        }}
                      >
                        <Button variant="contained" size="small">
                          <Typography variant="h5" component="p">
                            {" "}
                            +{" "}
                          </Typography>
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                          sx={{
                            my: 2,
                            width: `${matches ? "100%" : "calc(5rem + 2vw)"}`,
                          }}
                        />
                        <Button variant="contained" size="small">
                          <Typography variant="h5" component="p">
                            {" "}
                            -{" "}
                          </Typography>
                        </Button>
                      </Box>
                    </Box>
                    <Box
                      className={matches ? "f-column" : "f-row"}
                      sx={{ width: `${matches ? "100%" : "auto"}` }}
                    >
                      <Button
                        variant="contained"
                        sx={{ width: `${matches ? "100%" : "auto"}` }}
                      >
                        Put in Cart
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ width: `${matches ? "100%" : "auto"}` }}
                      >
                        Buy Now
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, my: 5 }}>
                    <Typography>{product.desc}</Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DisplayProduct;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
