import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  Grid,
  Paper,
  TextField,
  Autocomplete,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Input,
  Modal,
  Button,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const styleDecide = (product) => {
  if (!product.activeStatus || product.stockQty === 0) {
    return {
      backgroundColor: "#ddd",
    };
  }
};

const textDecide = (product) => {
  if (product.stockQty === 0) {
    return "Out of Stock";
  }
};

const formatter = new Intl.NumberFormat("id", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const FavoriteItemList = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const [products, setProducts] = useState([]);
  const [favList, setFavList] = useState([]);
  const router = useRouter();

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");
      const { userFavList, productData } = res.data;

      const favProducts = userFavList.map((ids) => {
        const result = productData.filter((item) => ids === item._id);
        return result[0];
      });

      setFavList(userFavList);
      setProducts(favProducts);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const unfavorite = (e, selectedProduct) => {
    e.stopPropagation();
    const newFavList = favList.filter(
      (eachId) => selectedProduct._id !== eachId
    );

    const newProducts = products.filter(
      (product) => selectedProduct._id !== product._id
    );

    setFavList(newFavList);
    setProducts(newProducts);
  };

  const handleSave = async () => {
    try {
      const newFavList = favList.sort((a, b) => {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      console.log(newFavList);
      const res = await axios.post("/api/products/favorite", {
        productId: newFavList,
        favorite: "Update",
      });

      console.log(res);
      router.push("/products");
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  };

  return (
    <Container
      sx={{
        pt: 12,
        pb: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      {products && (
        <Card className="f-row" variant="outlined" size="small">
          <CardContent className="f-col" sx={{ px: 5, width: "100%" }}>
            <Box
              className="f-space"
              sx={{
                mt: 2,
                mb: 1,
                flex: 1,
                alignItems: "center",
              }}
            >
              <Typography
                className="main-title"
                variant={matches ? "h5" : "h4"}
                component="h2"
              >
                Favorite List
              </Typography>
            </Box>

            {/* <List>
              {products.map((product) => (
                <ListItem
                  key={product._id}
                  onClick={() => router.push(`/store/${product._id}`)}
                  sx={{ py: 0, px: 2 }}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: ".5vw",
                    display: "flex",
                  }}
                >
                    
                  <Typography
                    sx={{
                      flex: 19,
                      letterSpacing: `${matches ? "0" : "1px"}`,
                    }}
                  >
                    {product.name}
                  </Typography>
                  <ListItemButton
                    sx={{ px: 1, flex: 1 }}
                    onClick={() => unfavorite(product)}
                  >
                    <RemoveCircleIcon color="primary" />
                  </ListItemButton>
                </ListItem>
              ))}
            </List> */}
            <Grid container spacing={3} sx={{ my: 1 }}>
              {products.map((product) => {
                return (
                  <Grid
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.85,
                      },
                    }}
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={product._id}
                    onClick={() => router.push(`/store/${product._id}`)}
                  >
                    <Card variant="outlined" sx={styleDecide(product)}>
                      <CardContent>
                        <Box sx={{ position: "relative" }}>
                          <Box
                            sx={{
                              position: "absolute",
                              right: 0,
                              mt: 1,
                              opacity: 1,
                              zIndex: 1,
                            }}
                          >
                            <IconButton
                              sx={{
                                mr: 1,
                              }}
                              onClick={(e) => {
                                unfavorite(e, product);
                              }}
                            >
                              <RemoveCircleIcon
                                color="primary"
                                fontSize="medium"
                              />
                            </IconButton>
                          </Box>
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              mb: 1,
                              opacity: 1,
                              zIndex: 1,
                            }}
                          >
                            {
                              <Typography
                                variant="overline"
                                component="p"
                                fontWeight="bold"
                                sx={{
                                  p: 1,
                                  py: 0.5,
                                  m: 1,
                                  borderRadius: "0.35vw",
                                  backgroundColor: `${
                                    !product.activeStatus ||
                                    product.stockQty === 0
                                      ? "#eee"
                                      : "none"
                                  }`,
                                }}
                              >
                                {textDecide(product)}
                              </Typography>
                            }
                          </Box>
                          <img
                            src={product.image[0]}
                            alt={`${product.name}-img`}
                            style={{
                              height: "calc(10rem + 2vw)",
                              opacity: `${product.stockQty === 0 ? 0.7 : 1}`,
                            }}
                          />
                        </Box>
                        <Box sx={{ my: 2, px: 1 }}>
                          <Typography variant="h6" component="h2">
                            {product.name}
                          </Typography>
                          <Typography
                            variant="h6"
                            component="p"
                            fontWeight={"bold"}
                          >
                            {formatter.format(product.price[0].price)}
                          </Typography>
                          <Box
                            className="f-space"
                            sx={{ alignItems: "center" }}
                          >
                            <Typography
                              sx={{ textTransform: "uppercase", my: 1 }}
                              variant="caption"
                              component="p"
                            >
                              {product.category.name}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            <Box
              sx={{
                mt: 3,
                alignSelf: "flex-end",
                width: `${matches ? "100%" : "auto"}`,
              }}
              className={matches ? "f-col" : "f-row"}
            >
              <Button
                sx={{
                  alignSelf: "flex-end",
                  width: `${matches ? "100%" : "auto"}`,
                }}
                variant="contained"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                sx={{
                  alignSelf: "flex-end",
                  width: `${matches ? "100%" : "auto"}`,
                }}
                style={{ marginLeft: `${matches ? "0" : ".5rem"}` }}
                variant="outlined"
                onClick={() => router.push("/products")}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default FavoriteItemList;

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