import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  Grid,
  TextField,
  Button,
  Checkbox,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const formatter = new Intl.NumberFormat("id", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const CartItemList = ({ user }) => {
  const switchNav = useMediaQuery("(max-width:900px)");
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");
  const [products, setProducts] = useState([]);
  const [basket, setBasket] = useState([]);
  const [selected, setSelected] = useState([]);
  const [subtotal, setSubtotal] = useState(formatter.format(0));
  const router = useRouter();
  const min = 1;
  const max = 0;

  const getPrice = (currentQty, selectedProduct) => {
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

  const findCartInfo = (product) => {
    const findInfo = basket.filter((obj) => obj.productId === product._id);
    return findInfo[0];
  };

  const getSelectedTotal = (arr = selected) => {
    const subtotal = arr.map((item) => item.price * item.quantity);
    const result = subtotal.reduce((partialSum, a) => partialSum + a, 0);
    setSubtotal(formatter.format(result));
    // return formatter.format(result);
  };

  const setAlignment = () => {
    if (stacks) return "center";
    else if (switchNav) return "flex-end";
    else return "space-between";
  };
  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");
      const { userBasket, productData } = res.data;

      const basketProducts = userBasket.map((obj) => {
        const result = productData.filter((item) => obj.productId === item._id);
        return result[0];
      });

      setBasket(userBasket);
      setProducts(basketProducts);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const deleteItem = (e, selectedProduct) => {
    e.stopPropagation();
    const newBasket = basket.filter(
      (obj) => selectedProduct._id !== obj.productId
    );

    const newProducts = products.filter(
      (product) => selectedProduct._id !== product._id
    );

    setBasket(newBasket);
    setProducts(newProducts);
  };

  const handleSave = async () => {
    try {
      const res = await axios.post("/api/cart/add", {
        basket,
        added: "Update",
      });

      console.log(res);
      //   router.push("/store");
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  };

  const handleCheckout = async () => {
    // try {
    //   const res = await axios.post("/api/cart/add", {
    //     basket,
    //     added: "Update",
    //   });
    //   console.log(res);
    //   //   router.push("/store");
    // } catch (err) {
    //   console.log(err.message);
    //   console.log(err.response?.data);
    //   throw new Error(err.message);
    // }
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
        <Box
          sx={{
            position: "fixed",
            zIndex: 10,
            py: 3,
            display: "block",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#eeeeee90",
            borderTop: "1px solid #ccc",
            px: 5,
          }}
          style={{ marginBottom: `${switchNav ? "3.75rem" : "0"}` }}
        >
          <Container sx={{ px: 5 }} maxWidth={matches ? "sm" : "lg"}>
            <Box
              className={stacks ? "f-col" : "f-space"}
              sx={{ alignItems: "center" }}
              style={{ margin: `${switchNav ? "0" : "0 2.5rem"}` }}
            >
              <Box
                className={stacks ? "f-col" : ""}
                sx={{ display: "flex", gap: 3 }}
              >
                <Box className="f-row">
                  <Checkbox />
                  <Typography>Select All</Typography>
                </Box>
                <Box className={stacks ? "f-col" : "f-row"}>
                  <Typography sx={{ mr: 1 }} variant="h6" component="p">
                    Total :
                  </Typography>
                  <Typography sx={{}} variant="h6" component="p">
                    {subtotal}
                  </Typography>
                  {selected.length > 0 && (
                    <Typography sx={{ ml: 2 }}>
                      {`(${selected.length} ${
                        selected.length > 1 ? "Products" : "Product"
                      })`}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box className="f-row">
                <Button sx={{ mr: 1 }} variant="outlined" onClick={handleSave}>
                  Save
                </Button>
                <Button
                  sx={{ ml: 1 }}
                  variant="contained"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}
      {products && (
        <Box className="f-row" variant="outlined" size="small">
          <Box className="f-col" sx={{ px: 5, width: "100%" }}>
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
                Shopping Cart
              </Typography>
            </Box>

            <Box sx={{ my: 1, py: 2 }}>
              {products.map((product) => {
                return (
                  <Box
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.85,
                      },
                    }}
                    key={product._id}
                    onClick={() => router.push(`/store/${product._id}`)}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        backgroundColor: `${
                          product.stockQty === 0 ? "#ddd" : "transparent"
                        }`,
                      }}
                    >
                      <CardContent className={switchNav ? "f-col" : "f-space"}>
                        <Box className="f-row">
                          <Box>
                            <Checkbox
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                // console.log(e.target.checked);

                                if (e.target.checked) {
                                  //   console.log("Selected into checkout");
                                  const thisProductObj = findCartInfo(product);
                                  setSelected((prevObjs) => [
                                    ...prevObjs,
                                    thisProductObj,
                                  ]);
                                  getSelectedTotal([
                                    ...selected,
                                    thisProductObj,
                                  ]);
                                } else {
                                  //   console.log("Deleted from checkout");
                                  const newSelected = selected.filter(
                                    (obj) => obj.productId !== product._id
                                  );
                                  setSelected(newSelected);
                                  getSelectedTotal(newSelected);
                                }
                              }}
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 30 } }}
                            />
                          </Box>
                          <Box>
                            <img
                              src={product.image[0]}
                              alt={`${product.name}-img`}
                              style={{
                                width: `${
                                  stacks ? "5rem" : "calc(7.5rem + 1vw)"
                                }`,
                                height: `${
                                  stacks ? "5rem" : "calc(7.5rem + 1vw)"
                                }`,
                                margin: "0 1rem",
                                opacity: `${product.stockQty === 0 ? 0.7 : 1}`,
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              my: 2,
                              px: 1,
                              width: `${
                                switchNav ? "100%" : "calc(13.5rem + 15vw)"
                              }`,
                            }}
                          >
                            <Typography
                              variant={stacks ? "body1" : "h6"}
                              component="h2"
                            >
                              {product.name}
                            </Typography>
                            <Box
                              sx={{ display: "flex", alignItems: "flex-end" }}
                            >
                              <Typography
                                variant={stacks ? "subtitle1" : "h6"}
                                component="p"
                                fontWeight={"bold"}
                              >
                                {formatter.format(findCartInfo(product).price)}
                              </Typography>
                              {findCartInfo(product).price !==
                                product.price[0].price && (
                                <Typography
                                  sx={{
                                    ml: 2,
                                    mb: 0.25,
                                    textDecoration: "line-through",
                                  }}
                                  variant={stacks ? "body1" : "caption"}
                                  component="p"
                                >
                                  {formatter.format(product.price[0].price)}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" component="p">
                              Total:{" "}
                              {formatter.format(
                                findCartInfo(product).price *
                                  findCartInfo(product).quantity
                              )}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          className={switchNav ? "" : "f-col"}
                          sx={{
                            display: "flex",
                            justifyContent: setAlignment(),
                            alignItems: "flex-end",
                          }}
                        >
                          <Box>
                            <Box
                              sx={{
                                opacity: 1,
                                zIndex: 1,
                              }}
                            >
                              <IconButton
                                sx={{
                                  mr: 1,
                                }}
                                onClick={(e) => {
                                  deleteItem(e, product);
                                }}
                              >
                                <DeleteIcon color="#ccc" fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          {product.stockQty > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
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
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          const { quantity: currentQty } =
                                            infoObj;
                                          return {
                                            productId: infoObj.productId,
                                            quantity:
                                              currentQty - 1 === 0
                                                ? 1
                                                : currentQty - 1,
                                            price: getPrice(
                                              currentQty - 1,
                                              product
                                            ).price,
                                          };
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);
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
                                  value={findCartInfo(product).quantity}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    let value = parseInt(e.target.value, 10);
                                    const max = product.stockQty;

                                    if (value > max) value = max;
                                    if (value < min) value = min;

                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          return {
                                            productId: infoObj.productId,
                                            quantity: value,
                                            price:
                                              value >= 1
                                                ? getPrice(value, product).price
                                                : infoObj.price,
                                          };
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const max = product.stockQty;

                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          const { quantity: currentQty } =
                                            infoObj;
                                          return {
                                            productId: infoObj.productId,
                                            quantity:
                                              currentQty + 1 > max
                                                ? currentQty
                                                : currentQty + 1,
                                            price: getPrice(
                                              currentQty + 1,
                                              product
                                            ).price,
                                          };
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </span>
                              </Box>
                            </Box>
                          )}
                          {product.stockQty === 0 && (
                            <Box className="f-row">
                              <Typography
                                variant="overline"
                                component="p"
                                fontWeight="bold"
                                sx={{
                                  p: 2,
                                  mt: 1,
                                  borderRadius: "0.35vw",
                                  backgroundColor: "#eee",
                                  lineHeight: "150%",
                                }}
                                textAlign="center"
                                noWrap
                              >
                                Out of Stock
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default CartItemList;

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

{
  /* <span
                                  className="buttonAdd f-row"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const newObj = {};
                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          const { quantity: currentQty } =
                                            infoObj;

                                          newObj.productId = infoObj.productId;

                                          newObj.quantity =
                                            currentQty - 1 === 0
                                              ? 1
                                              : currentQty - 1;

                                          newObj.price = getPrice(
                                            currentQty - 1,
                                            product
                                          ).price;

                                          return newObj;
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);

                                    // console.log(newObj);

                                    const otherItems = selected.filter(
                                      (selectedItem) =>
                                        selectedItem.productId !== product._id
                                    );
                                    // console.log(otherItems);

                                    if (otherItems.length !== selected.length) {
                                      getSelectedTotal([...otherItems, newObj]);
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
                                  value={findCartInfo(product).quantity}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    let value = parseInt(e.target.value, 10);
                                    const max = product.stockQty;

                                    if (value > max) value = max;
                                    if (value < min) value = min;

                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          return {
                                            productId: infoObj.productId,
                                            quantity: value,
                                            price:
                                              value >= 1
                                                ? getPrice(value, product).price
                                                : infoObj.price,
                                          };
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const max = product.stockQty;

                                    const newObj = {};
                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          const { quantity: currentQty } =
                                            infoObj;

                                          newObj.productId = infoObj.productId;

                                          newObj.quantity =
                                            currentQty + 1 > max
                                              ? currentQty
                                              : currentQty + 1;

                                          newObj.price = getPrice(
                                            currentQty + 1,
                                            product
                                          ).price;

                                          return newObj;
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);
                                    const otherItems = selected.filter(
                                      (selectedItem) =>
                                        selectedItem.productId !== product._id
                                    );
                                    // console.log(otherItems);

                                    if (otherItems.length !== selected.length) {
                                      getSelectedTotal([...otherItems, newObj]);
                                    }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </span> */
}
