import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  TextField,
  InputLabel,
  FormLabel,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

const DisplayProduct = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [allProduct, setAllProduct] = useState([]);
  const [imgPath, setImgPath] = useState([]);
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:480px)");
  const min = 1;
  const [max, setMax] = useState(0);

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
      setMax(searched[0].stockQty);
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
            <Typography
              variant={matches ? "h5" : "h4"}
              sx={{
                textTransform: "uppercase",
                fontWeight: `${matches ? 600 : 300}`,
              }}
              component="h2"
            >
              Product Information
            </Typography>
            {product && (
              <Box
                className={matches ? "f-column" : "f-space"}
                sx={{
                  gap: 5,
                  my: 5,
                  minHeight: `${matches ? "auto" : "calc(17.5rem + 5vw)"}`,
                  justifyContent: "flex-start",
                }}
              >
                <Box
                  className="f-col"
                  sx={{
                    flex: 1,
                  }}
                >
                  <Box>
                    <img
                      style={{
                        objectFit: "center",
                        height: `${matches ? "auto" : "calc(15rem + 5vw)"}`,
                      }}
                      src={product.image[0]}
                    />
                  </Box>
                  <Box className="f-row" style={{ alignItems: "flex-start" }}>
                    {product.image.map((img) => (
                      <Box key={img} sx={{ flex: 1 }}>
                        <img
                          style={{ objectFit: "center", height: "6rem" }}
                          src={img}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ flex: 2 }}>
                  <Box sx={{ flex: 1, mb: 2 }}>
                    <Typography
                      variant={matches ? "subtitle1" : "text"}
                      component="p"
                      gutterBottom
                    >
                      {product.category?.name}
                    </Typography>
                    <Typography
                      variant={matches ? "h6" : "h5"}
                      component="h2"
                      gutterBottom
                    >
                      {product.name}
                    </Typography>
                    <Typography variant={matches ? "h6" : "h5"} component="p">
                      {formatter.format(product.price[0].price)}
                    </Typography>
                  </Box>
                  <Box
                    className="f-col"
                    sx={{
                      width: `${matches ? "100%" : "auto"}`,
                      mx: 0,
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Box
                      className="f-col"
                      sx={{
                        width: "100%",
                        flex: 1,
                        mx: 0,
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: `${
                            matches ? "space-between" : "flex-start"
                          }`,
                          width: "100%",
                        }}
                      >
                        <InputLabel
                          sx={{ mr: 7.5 }}
                          style={{ flex: `${matches ? 5 : "none"}` }}
                        >
                          <Typography variant={stacks ? "text" : "h6"}>
                            Quantity
                          </Typography>
                        </InputLabel>
                        <Box
                          className="f-row"
                          sx={{
                            flex: 1,
                            mx: 0,
                            borderRadius: "5px",
                          }}
                          style={{
                            border: "1px solid #ddd",
                            flex: `${matches ? 1 : "none"}`,
                          }}
                        >
                          <span
                            className="buttonAdd"
                            onClick={() => {
                              console.log(quantity);

                              setQuantity((value) =>
                                quantity - 1 === 0 ? value : value - 1
                              );
                            }}
                          >
                            <Typography variant="h5" component="p">
                              {" "}
                              -{" "}
                            </Typography>
                          </span>
                          <TextField
                            inputProps={{
                              min,
                              max,
                              style: {
                                textAlign: "center",
                                padding: "0.55rem 0",
                                letterSpacing: "1px",
                              },
                            }}
                            type="number"
                            size="small"
                            value={quantity}
                            onChange={(e) => {
                              let value = parseInt(e.target.value, 10);
                              if (value > max) value = max;
                              if (value < min) value = min;

                              setQuantity(value);
                            }}
                            required
                            sx={{
                              mx: 0,
                              p: 0,
                              width: "3.75rem",
                            }}
                          />
                          <span
                            className="buttonAdd"
                            onClick={() => {
                              console.log(quantity);

                              setQuantity((value) =>
                                quantity + 1 > max ? value : value + 1
                              );
                            }}
                          >
                            <Typography variant="h5" component="p">
                              {" "}
                              +{" "}
                            </Typography>
                          </span>
                        </Box>
                      </Box>
                      <Box
                        className={matches ? "f-column" : "f-row"}
                        sx={{ width: `${matches ? "100%" : "auto"}`, my: 3 }}
                      >
                        <Button
                          style={{ marginRight: `${matches ? "0" : "1rem"}` }}
                          variant="contained"
                          sx={{ width: `${matches ? "100%" : "auto"}` }}
                          onClick={() => {
                            if (!quantity) setQuantity(1);
                          }}
                        >
                          <AddShoppingCartIcon sx={{ mr: 1, fontSize: 18 }} />
                          <Typography>Put in Cart</Typography>
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{ width: `${matches ? "100%" : "auto"}` }}
                          onClick={() => {
                            if (!quantity) setQuantity(1);
                          }}
                        >
                          <Typography>Buy Now</Typography>
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  {product.desc && (
                    <Box
                      sx={{ flex: 1, my: 5, pt: 2 }}
                      style={{ borderTop: "1px solid #ddd" }}
                    >
                      <FormLabel>
                        <Typography variant={stacks ? "text" : "h6"}>
                          Description
                        </Typography>
                      </FormLabel>
                      <Typography
                        sx={{ lineHeight: "135%", my: 1 }}
                        variant="body1"
                        component="p"
                      >
                        {product.desc}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
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
