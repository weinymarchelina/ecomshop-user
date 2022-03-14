import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
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

  const getPrice = (currentQty, selectedProduct = product) => {
    if (selectedProduct.price.length === 1) {
      return selectedProduct.price[0];
    }

    const rules = selectedProduct.price.reduce((a, b) => {
      return Math.abs(b.minOrder - currentQty) <
        Math.abs(a.minOrder - currentQty)
        ? b
        : a;
    });

    const priceCheck = selectedProduct.price
      .map((path, i, arr) => {
        if (path.minOrder === rules.minOrder) {
          if (rules.minOrder <= currentQty) {
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
  };

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");
      const { userBasket, productData } = res.data;

      const basketProducts = userBasket.map((obj) => {
        const result = productData.filter((item) => obj.productId === item._id);
        return result[0];
      });

      const sortedProducts = basketProducts.sort(
        (a, b) => (b.stockQty !== 0) - (a.stockQty !== 0)
      );

      setBasket(userBasket);
      setProducts(sortedProducts);
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
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
    const noNull = basket.map((item) => {
      if (!item.quantity) {
        item.quantity = 1;
      }

      return item;
    });
    setBasket(noNull);

    try {
      await axios.post("/api/cart/add", {
        basket: noNull,
        added: "Update",
      });

      router.push("/store");
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  };

  const handleCheckout = async () => {
    const noNull = basket.map((item) => {
      if (!item.quantity) {
        item.quantity = 1;
      }

      return item;
    });
    setBasket(noNull);

    try {
      const res = await axios.post("/api/cart/add", {
        basket: noNull,
        added: "Update",
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("selected", JSON.stringify(selected));
        localStorage.setItem("prevpath", "cart");
      }
      router.push("/checkout");
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
      maxWidth="lg"
    >
      {products && (
        <Box
          sx={{
            position: "fixed",
            zIndex: 10,
            display: "block",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            borderTop: "1px solid #ccc",
          }}
          style={{
            marginBottom: `${switchNav ? "3.5rem" : "0"}`,
            padding: `${switchNav ? "0.75rem 0" : "1rem 0 "}`,
          }}
        >
          <Container
            style={{ padding: `${stacks ? "0 1rem" : "0 2rem"}` }}
            maxWidth={matches ? "sm" : "lg"}
          >
            <Box
              className="f-space"
              sx={{ alignItems: "flex-end" }}
              style={{ margin: `${switchNav ? "0" : "0 2.5rem"}` }}
            >
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box className="f-col">
                  <Typography
                    sx={{
                      mr: 1,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                    variant="caption"
                    component="p"
                  >
                    Total
                  </Typography>
                  <Typography variant={stacks ? "body1" : "h6"} component="p">
                    {subtotal}
                  </Typography>
                </Box>
              </Box>
              <Box className="f-row">
                <Button
                  sx={{ mr: 0.5 }}
                  variant="outlined"
                  onClick={(e) => {
                    e.target.disabled = true;
                    handleSave();
                  }}
                  size={stacks ? "small" : "large"}
                >
                  Save
                </Button>
                <Button
                  sx={{ ml: 0.5 }}
                  variant="contained"
                  onClick={(e) => {
                    e.target.disabled = true;
                    handleCheckout();
                  }}
                  size={stacks ? "small" : "large"}
                  disabled={!selected.length > 0}
                >
                  Checkout {selected.length > 0 ? `( ${selected.length} )` : ""}
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}
      {products && (
        <Box
          sx={{
            minHeight: `${
              switchNav
                ? `calc(11.5rem * ${products.length + 1})`
                : `calc(9rem * ${products.length + 1})`
            }`,
          }}
        >
          <Box className="f-col" sx={{ width: "100%" }}>
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

            <Box sx={{ my: 2 }}>
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
                          product.stockQty === 0 ? "#eeeee80" : "transparent"
                        }`,
                        opacity: `${product.stockQty === 0 ? 0.7 : 1}`,
                      }}
                    >
                      <CardContent className={switchNav ? "f-col" : "f-space"}>
                        <Box className="f-row">
                          <Box
                            className="f-row"
                            sx={{
                              justifyContent: "flex-start",
                              alignItems: "flex-start",
                            }}
                          >
                            <Checkbox
                              disabled={product.stockQty > 0 ? false : true}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const thisProductObj = findCartInfo(product);

                                  setSelected([...selected, thisProductObj]);
                                  getSelectedTotal([
                                    ...selected,
                                    thisProductObj,
                                  ]);
                                } else {
                                  const newSelected = selected.filter(
                                    (obj) => obj.productId !== product._id
                                  );
                                  setSelected(newSelected);
                                  getSelectedTotal(newSelected);
                                }
                              }}
                              sx={{
                                "& .MuiSvgIcon-root": {
                                  fontSize: `${stacks ? 20 : 30}`,
                                },
                              }}
                              style={{ padding: `${stacks ? 0 : ""}` }}
                            />
                          </Box>
                          <Box>
                            <img
                              src={product.image[0]}
                              alt={`${product.name}-img`}
                              style={{
                                width: `${
                                  stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                }`,
                                height: `${
                                  stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                }`,
                                margin: "0 .5rem",
                                opacity: `${product.stockQty === 0 ? 0.7 : 1}`,
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              my: 2,
                              px: 1,
                              flex: 1,
                              width: `${matches ? "9rem" : "auto"}`,
                            }}
                          >
                            <Typography
                              variant="body1"
                              component="h2"
                              noWrap
                              sx={{ width: "100%" }}
                            >
                              {product.name}
                            </Typography>
                            <Box
                              sx={{ display: "flex", alignItems: "flex-end" }}
                            >
                              <Typography component="p" fontWeight={"bold"}>
                                {product.stockQty > 0
                                  ? formatter.format(
                                      findCartInfo(product).price
                                    )
                                  : formatter.format(product.price[0].price)}
                              </Typography>
                              {product.stockQty > 0 &&
                                findCartInfo(product).price !==
                                  product.price[0].price && (
                                  <Typography
                                    sx={{
                                      ml: 1,
                                      textDecoration: "line-through",
                                    }}
                                    variant="caption"
                                    component="p"
                                  >
                                    {formatter.format(product.price[0].price)}
                                  </Typography>
                                )}
                            </Box>
                            {product.stockQty > 0 && (
                              <Typography variant="caption" component="p">
                                Total:{" "}
                                {formatter.format(
                                  findCartInfo(product).price *
                                    findCartInfo(product).quantity
                                )}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box
                          className={switchNav ? "" : "f-col"}
                          sx={{
                            display: "flex",
                            justifyContent: `${
                              switchNav ? "flex-end" : "space-between"
                            }`,
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
                                  style={{
                                    padding: `${
                                      stacks ? "0.1rem 0.5rem" : "0.25rem 1rem"
                                    }`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    let newObj;
                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          const { quantity: currentQty } =
                                            infoObj;

                                          newObj = {
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
                                          return newObj;
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);

                                    const thisProduct = selected.filter(
                                      (item) => item.productId === product._id
                                    );

                                    if (thisProduct[0]) {
                                      const otherProducts = selected.filter(
                                        (item) => item.productId !== product._id
                                      );

                                      setSelected([...otherProducts, newObj]);
                                      getSelectedTotal([
                                        ...otherProducts,
                                        newObj,
                                      ]);
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
                                      padding: `${
                                        stacks ? "0.25rem 0" : "0.5rem 0"
                                      }`,
                                      letterSpacing: "1px",
                                    },
                                  }}
                                  type="number"
                                  size="small"
                                  value={
                                    findCartInfo(product).quantity >
                                    product.stockQty
                                      ? product.stockQty
                                      : findCartInfo(product).quantity
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    let value = parseInt(e.target.value, 10);
                                    const max = product.stockQty;

                                    if (value > max) value = max;
                                    if (value < min) value = min;

                                    if (!value) value = "";

                                    let newObj;
                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          newObj = {
                                            productId: infoObj.productId,
                                            quantity: value,
                                            price:
                                              value >= 1
                                                ? getPrice(value, product).price
                                                : infoObj.price,
                                          };
                                          return newObj;
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);

                                    const thisProduct = selected.filter(
                                      (item) => item.productId === product._id
                                    );

                                    if (thisProduct[0]) {
                                      const otherProducts = selected.filter(
                                        (item) => item.productId !== product._id
                                      );

                                      setSelected([...otherProducts, newObj]);
                                      getSelectedTotal([
                                        ...otherProducts,
                                        newObj,
                                      ]);
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
                                  style={{
                                    padding: `${
                                      stacks ? "0.1rem 0.5rem" : "0.25rem 1rem"
                                    }`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const max = product.stockQty;

                                    let newObj;
                                    const updatedBasket = basket.map(
                                      (infoObj) => {
                                        if (infoObj.productId === product._id) {
                                          const { quantity: currentQty } =
                                            infoObj;
                                          newObj = {
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
                                          return newObj;
                                        }

                                        return infoObj;
                                      }
                                    );
                                    setBasket(updatedBasket);

                                    const thisProduct = selected.filter(
                                      (item) => item.productId === product._id
                                    );

                                    if (thisProduct[0]) {
                                      const otherProducts = selected.filter(
                                        (item) => item.productId !== product._id
                                      );

                                      setSelected([...otherProducts, newObj]);
                                      getSelectedTotal([
                                        ...otherProducts,
                                        newObj,
                                      ]);
                                    }
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
                                  py: 2,
                                  px: 4.5,
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
