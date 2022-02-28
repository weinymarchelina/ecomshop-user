import { getSession } from "next-auth/react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  Grid,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useRouter } from "next/router";

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

const Product = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const [products, setProducts] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categoryList, setCategoryList] = useState([]);
  const [sortType, setSortType] = useState("Default");
  const [favItemList, setFavItemList] = useState([]);
  const router = useRouter();

  const sortList = [
    "Default",
    "Lowest Price",
    "Highest Price",
    "Lowest Quantity",
    "Highest Quantity",
  ];

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");
      // console.log(res.data);
      const { productData, businessCategory, userFavList } = res.data;

      setCategoryList(businessCategory);

      setProducts(productData);
      setFavItemList(userFavList);
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);

      throw new Error(err.message);
    }
  }, [favItemList]);

  const categoryProducts = () => {
    if (selectedCategory === "All") return products;
    else if (selectedCategory !== "All")
      return products.filter(
        (product) => product.category.name === selectedCategory.name
      );
  };

  const filterProducts = () => {
    if (searchTerm) {
      return categoryProducts().filter((product) =>
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    return categoryProducts();
  };

  const filteredProducts = filterProducts();

  const sortProducts = () => {
    let sortedProducts;
    if (filteredProducts) {
      switch (sortType) {
        case "Lowest Price":
          sortedProducts = filteredProducts.sort(
            (a, b) => a.price[0].price - b.price[0].price
          );

          break;

        case "Highest Price":
          sortedProducts = filteredProducts.sort(
            (a, b) => b.price[0].price - a.price[0].price
          );

          break;

        case "Lowest Quantity":
          sortedProducts = filteredProducts.sort(
            (a, b) => a.stockQty - b.stockQty
          );
          break;

        case "Highest Quantity":
          sortedProducts = filteredProducts.sort(
            (a, b) => b.stockQty - a.stockQty
          );

          break;

        default:
          sortedProducts = filteredProducts
            .sort((a, b) => {
              const textA = a.name.toUpperCase();
              const textB = b.name.toUpperCase();
              return textA < textB ? -1 : textA > textB ? 1 : 0;
            })
            .sort((a, b) => (b.stockQty !== 0) - (a.stockQty !== 0));

          break;
      }
    } else {
      sortedProducts = products;
    }

    return sortedProducts;
  };
  const finalProducts = sortProducts();

  const favoriteStatus = (selectedProduct) => {
    const getStatus = favItemList.filter(
      (item) => item === selectedProduct._id
    );
    if (getStatus[0]) {
      return true;
    } else {
      return false;
    }
  };

  const handleFavorite = async (e, selectedProduct) => {
    e.stopPropagation();
    console.log(favItemList);

    const checkResult = favoriteStatus(selectedProduct);

    try {
      await axios.post("/api/products/favorite", {
        productId: selectedProduct._id,
        favorite: checkResult,
      });
      setFavItemList((prevList) => [...prevList, selectedProduct._id]);
    } catch (err) {
      console.log(err.response.data.msg);
      return;
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
                flex: 1,
                alignItems: "center",
              }}
            >
              <Typography
                className="main-title"
                variant={matches ? "h5" : "h4"}
                component="h2"
              >
                Store
              </Typography>
            </Box>

            {finalProducts && (
              <>
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent
                    className={`${matches ? "f-col" : "f-space"}`}
                    sx={{ alignItems: "center", py: 3, gap: 3 }}
                  >
                    <Box
                      className="f-space"
                      sx={{ flex: 2, gap: 3, width: "100%" }}
                    >
                      <FormControl variant="standard" sx={{ flex: 1 }}>
                        <InputLabel>Filter</InputLabel>
                        <Select
                          value={selectedCategory}
                          label="Category"
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <MenuItem value="All">
                            <Typography variant="subtitle1" component="p">
                              All
                            </Typography>
                          </MenuItem>
                          {categoryList.map((category) => (
                            <MenuItem key={category.name} value={category}>
                              <Typography variant="subtitle1" component="p">
                                {category.name}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl variant="standard" sx={{ flex: 1 }}>
                        <InputLabel>Sort</InputLabel>
                        <Select
                          value={sortType}
                          label="Sort"
                          onChange={(e) => setSortType(e.target.value)}
                        >
                          {sortList.map((type) => (
                            <MenuItem key={type} value={type}>
                              <Typography variant="subtitle1" component="p">
                                {type}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <TextField
                      onChange={(e) => setSearchTerm(e.target.value)}
                      label="Search"
                      variant="standard"
                      sx={{ flex: 2, pt: 0.65 }}
                      autoComplete="off"
                      fullWidth
                    />
                  </CardContent>
                </Card>

                <Grid container spacing={3} sx={{ my: 1 }}>
                  {filteredProducts.map((product) => {
                    return (
                      <Grid
                        item
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.85,
                          },
                        }}
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
                                  size="small"
                                  sx={{
                                    backgroundColor: "#eeeeee90",
                                    mr: 1,
                                  }}
                                  onClick={(e) => {
                                    handleFavorite(e, product);
                                  }}
                                >
                                  <FavoriteIcon
                                    sx={{
                                      color: `${
                                        favoriteStatus(product)
                                          ? "firebrick"
                                          : ""
                                      }`,
                                      "&:hover": {
                                        color: "#fff",
                                      },
                                    }}
                                    fontSize="small"
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
                                  opacity: `${
                                    product.stockQty === 0 ? 0.7 : 1
                                  }`,
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
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Product;

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
