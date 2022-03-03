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
  IconButton,
  Modal,
  Grid,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const DisplayProduct = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;
  // console.log(id);

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [nextProducts, setNextProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:480px)");
  const min = 1;
  const [max, setMax] = useState(0);
  const [price, setPrice] = useState(0);
  const [cartQty, setCartQty] = useState(0);
  const [notif, setNotif] = useState(null);

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "95vw",
    maxWidth: "calc(25rem + 30vw)",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 5,
    mr: 1,
  };

  const getPrice = (currentQty, selectedProduct = product) => {
    if (selectedProduct.price.length === 1) {
      return selectedProduct.price[0];
    }

    const rules = selectedProduct.price.reduce((a, b) => {
      return Math.abs(b.minOrder - currentQty) <
        Math.abs(a.minOrder - currentQty)
        ? b.minOrder
        : a.minOrder;
    });

    const priceCheck = selectedProduct.price
      .map((path, i, arr) => {
        if (path.minOrder === rules) {
          if (rules <= currentQty) {
            return path;
          } else {
            const prevPath = i - 1;
            return arr[prevPath];
          }
        }
      })
      .find((obj) => obj);

    return priceCheck;
  };

  const getIndex = (allItems, num, selectedProduct) => {
    let index = 0;
    allItems.filter((eachProduct) => {
      if (eachProduct._id === selectedProduct._id) {
        index = allItems.indexOf(eachProduct);
      }
    });

    let next = index + num;
    if (next > allItems.length - 1) {
      const result = next - allItems.length;
      next = result;
    }

    return next;
  };

  const getNextProducts = (allItems, selectedProduct) => {
    let counter = 1;
    const arrProducts = [];

    while (counter < 2) {
      const nextProduct =
        allItems[getIndex(allItems, counter, selectedProduct)];
      // console.log(nextProduct);
      arrProducts.push(nextProduct);
      counter++;
    }

    return arrProducts;
  };

  const handleCart = async () => {
    try {
      const result = await axios.post("/api/cart/add", {
        price,
        quantity,
        productId: product._id,
        added: false,
        priceList: product.price,
      });

      const { basket } = result.data.result;
      console.log(basket);
      const productCartQty = basket.filter((item) => item.productId === id);
      console.log(productCartQty);
      setCartQty(productCartQty[0].quantity);

      const expectedQty = 1 + productCartQty[0].quantity;
      console.log(expectedQty);
      setPrice(getPrice(expectedQty).price);
      setQuantity(1);
    } catch (err) {
      console.log(err.response.data.msg);
      console.log(err.response.data);
      return;
    }
  };

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");

      const { productData, userBasket } = res.data;
      const searched = productData.filter((product) => product._id === id);
      const mainProduct = searched[0];

      console.log(userBasket);
      const productCartQty = userBasket.filter((item) => item.productId === id);

      // let currentCartQty;
      // if (productCartQty[0]) {
      //   currentCartQty = productCartQty[0].quantity;
      // } else {
      //   currentCartQty = 0;
      // }

      const currentCartQty = productCartQty[0] ? productCartQty[0].quantity : 0;
      setCartQty(currentCartQty);
      const expectedQty = 1 + currentCartQty;
      // console.log(currentCartQty);
      // console.log(expectedQty);
      setPrice(getPrice(expectedQty, mainProduct).price);
      setMax(mainProduct.stockQty - currentCartQty);
      // setPrice(mainProduct.price[0].price);
      setQuantity(1);
      setProduct(mainProduct);

      // const arrProducts = getNextProducts();
      const allActive = productData.filter((product) => product.stockQty !== 0);
      setNextProducts(getNextProducts(allActive, mainProduct));
    } catch (err) {
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, [id]);

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
                textAlign: "center",
                fontWeight: `${matches ? 600 : 300}`,
              }}
              component="h2"
            >
              Product Information
            </Typography>
            {product && (
              <>
                <Modal open={open} onClose={() => setOpen(false)}>
                  <Box sx={modalStyle} className="f-column">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (1 > imgIndex) {
                          setImgIndex(product.image.length - 1);
                        } else {
                          setImgIndex((val) => val - 1);
                        }
                      }}
                      sx={{
                        position: "absolute",
                        zIndex: 1,
                        top: "50%",
                        left: 0,
                        transform: "translate(0%, -50%)",
                        backgroundColor: "#eeeeee80",
                        "&:hover": {
                          backgroundColor: "#aaaaaa80",
                          opacity: 1,
                        },
                        ml: "calc(1rem + 1vw)",
                      }}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    <img
                      onClick={() => {
                        setOpen(true);
                      }}
                      style={{
                        objectFit: "contain",
                        width: "100%",
                        maxHeight: "90vh",
                      }}
                      src={product.image[imgIndex]}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.image.length - 1 <= imgIndex) {
                          setImgIndex(0);
                        } else {
                          setImgIndex((val) => val + 1);
                        }
                      }}
                      sx={{
                        position: "absolute",
                        zIndex: 1,
                        backgroundColor: "#eeeeee80",
                        right: 0,
                        top: "50%",
                        transform: "translate(0%, -50%)",
                        "&:hover": {
                          backgroundColor: "#aaaaaa80",
                          opacity: 1,
                        },
                        mr: "calc(1rem + 1vw)",
                      }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Box>
                </Modal>
                <Box className="f-col">
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
                        flex: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        style={{
                          height: `${matches ? "auto" : "calc(20rem + 5vw)"}`,
                          position: "relative",
                        }}
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            if (1 > imgIndex) {
                              setImgIndex(product.image.length - 1);
                            } else {
                              setImgIndex((val) => val - 1);
                            }
                          }}
                          sx={{
                            position: "absolute",
                            zIndex: 1,
                            top: "50%",
                            transform: "translate(0%, -50%)",
                            backgroundColor: "#eeeeee80",
                            "&:hover": {
                              backgroundColor: "#aaaaaa80",
                              opacity: 1,
                            },
                            ml: 1,
                          }}
                        >
                          <ArrowBackIosNewIcon />
                        </IconButton>
                        <img
                          onClick={() => {
                            setOpen(true);
                          }}
                          style={{
                            objectFit: "center",
                            width: "100%",
                            height: `${matches ? "50vw" : "100%"}`,
                            cursor: "pointer",
                          }}
                          src={product.image[imgIndex]}
                        />
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.image.length - 1 <= imgIndex) {
                              setImgIndex(0);
                            } else {
                              setImgIndex((val) => val + 1);
                            }
                          }}
                          sx={{
                            position: "absolute",
                            zIndex: 1,
                            backgroundColor: "#eeeeee80",
                            right: 0,
                            top: "50%",
                            transform: "translate(0%, -50%)",
                            "&:hover": {
                              backgroundColor: "#aaaaaa80",
                              opacity: 1,
                            },
                            mr: 1,
                          }}
                        >
                          <ArrowForwardIosIcon />
                        </IconButton>
                      </Box>

                      <Box
                        className="f-row"
                        sx={{
                          alignItems: "flex-start",
                          width: "100%",
                          gap: 0.5,
                          mt: 1,
                        }}
                      >
                        {product.image.map((img, index) => (
                          <Box
                            key={img}
                            sx={{ flex: 1, cursor: "pointer" }}
                            onClick={() => setImgIndex(index)}
                          >
                            <img
                              style={{
                                opacity: `${index === imgIndex ? 0.7 : 1}`,
                                objectFit: "center",
                                height: `${
                                  matches
                                    ? "calc(2rem + 2.5vw)"
                                    : "calc(2rem + 3vw)"
                                }`,
                              }}
                              src={img}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ flex: 3, width: "100%" }}>
                      <Box sx={{ flex: 1, mb: 2 }}>
                        <Typography
                          variant={matches ? "h6" : "h5"}
                          component="h2"
                          gutterBottom
                        >
                          {product.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                          <Typography
                            variant={matches ? "h5" : "h4"}
                            component="p"
                          >
                            {formatter.format(price)}
                          </Typography>
                          {price !== product.price[0].price && (
                            <Typography
                              sx={{
                                ml: 2,

                                textDecoration: "line-through",
                              }}
                              style={{
                                marginBottom: `${
                                  matches ? "0.15rem" : "0.25rem"
                                }`,
                              }}
                              component="p"
                            >
                              {formatter.format(product.price[0].price)}
                            </Typography>
                          )}
                        </Box>
                        {cartQty > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ mt: 1 }}>
                              You have {cartQty} pcs in your cart. By adding{" "}
                              {quantity} pcs, you will have {cartQty + quantity}{" "}
                              pcs of this product.
                            </Typography>
                          </Box>
                        )}
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
                          {product.stockQty > 0 && (
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
                                  className="buttonAdd f-row"
                                  onClick={() => {
                                    setQuantity((value) =>
                                      quantity - 1 === 0 ? value : value - 1
                                    );

                                    if (quantity - 1 >= 1) {
                                      setPrice(
                                        getPrice(quantity - 1 + cartQty).price
                                      );
                                    }
                                  }}
                                >
                                  <RemoveIcon fontSize="small" />
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

                                    if (value >= 1) {
                                      setPrice(getPrice(value + cartQty).price);
                                    }
                                  }}
                                  required
                                  sx={{
                                    mx: 0,
                                    p: 0,
                                    width: "3.75rem",
                                  }}
                                />
                                <span
                                  className="buttonAdd  f-row"
                                  onClick={() => {
                                    setQuantity((value) =>
                                      quantity + 1 > max ? value : value + 1
                                    );

                                    console.log(cartQty);
                                    if (quantity + 1 >= 1) {
                                      setPrice(
                                        getPrice(quantity + 1 + cartQty).price
                                      );
                                    }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </span>
                              </Box>
                            </Box>
                          )}
                          <Box
                            className={matches ? "f-column" : "f-row"}
                            sx={{
                              width: `${matches ? "100%" : "auto"}`,
                              my: 3,
                            }}
                          >
                            {product.stockQty > 0 && (
                              <>
                                <Button
                                  style={{
                                    marginRight: `${matches ? "0" : "1rem"}`,
                                  }}
                                  variant="contained"
                                  sx={{ width: `${matches ? "100%" : "auto"}` }}
                                  onClick={() => {
                                    if (!quantity) setQuantity(1);
                                    handleCart();
                                  }}
                                >
                                  <AddShoppingCartIcon
                                    sx={{ mr: 1, fontSize: 18 }}
                                  />
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
                              </>
                            )}
                            {product.stockQty === 0 && (
                              <Button
                                variant="outlined"
                                sx={{ width: "100%", cursor: "context-menu" }}
                              >
                                <Typography>Out of Stock</Typography>
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{ flex: 1, my: 5, pt: 2 }}
                        style={{ borderTop: "1px solid #ddd" }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <FormLabel>
                            <Typography variant="subtitle1">
                              Category
                            </Typography>
                          </FormLabel>
                          <Typography
                            sx={{ my: 1 }}
                            variant="body1"
                            component="p"
                          >
                            {product.category.name}
                          </Typography>
                        </Box>

                        {product.price.length > 1 && (
                          <Box sx={{ mb: 2 }}>
                            <FormLabel>
                              <Typography variant="subtitle1">
                                Price List
                              </Typography>
                            </FormLabel>
                            <Box sx={{ my: 1 }}>
                              {product.price.map((tag) => (
                                <Typography
                                  key={tag.minOrder}
                                  sx={{ letterSpacing: "1px" }}
                                >
                                  {formatter.format(tag.price)} for{" "}
                                  {tag.minOrder} pcs
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {product.desc && (
                          <Box sx={{ mb: 2 }}>
                            <FormLabel>
                              <Typography variant="subtitle1">
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
                  </Box>
                  <Box
                    className="f-column"
                    sx={{ pt: 7 }}
                    style={{
                      borderTop: "1px solid #ddd",
                      marginTop: `${matches ? "0" : "5rem"}`,
                    }}
                  >
                    <Typography variant={matches ? "h5" : "h4"} component="p">
                      Other Products
                    </Typography>
                    <Grid container spacing={3} sx={{ my: 2 }}>
                      {nextProducts.map((eachProduct) => (
                        <Grid
                          item
                          sx={{
                            cursor: "pointer",
                            width: "100%",
                            "&:hover": {
                              opacity: 0.85,
                            },
                          }}
                          xs={12}
                          sm={6}
                          md={4}
                          key={eachProduct._id}
                          onClick={() =>
                            router.push(`/store/${eachProduct._id}`)
                          }
                        >
                          <Card variant="outlined" sx={{ width: "100%" }}>
                            <CardContent>
                              <Box sx={{ position: "relative" }}>
                                <img
                                  src={eachProduct.image[0]}
                                  alt={`${eachProduct.name}-img`}
                                  style={{
                                    height: "calc(10rem + 2vw)",
                                    opacity: `${
                                      eachProduct.stockQty === 0 ? 0.7 : 1
                                    }`,
                                  }}
                                />
                              </Box>
                              <Box sx={{ my: 2, px: 1 }}>
                                <Typography variant="h6" component="h2">
                                  {eachProduct.name}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  component="p"
                                  fontWeight={"bold"}
                                >
                                  {formatter.format(eachProduct.price[0].price)}
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
                                    {eachProduct.category.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </>
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
