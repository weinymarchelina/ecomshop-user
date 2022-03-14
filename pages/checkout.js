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
  FormControl,
  Input,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";

const formatter = new Intl.NumberFormat("id", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const Checkout = ({ user }) => {
  const switchNav = useMediaQuery("(max-width:900px)");
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("Walk-in");
  const paymentList = ["Cash on Delivery", "Transfer", "Walk-in"];
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [subtotal, setSubtotal] = useState(formatter.format(0));
  const [prevPath, setPrevPath] = useState();
  const [clicked, setClicked] = useState(false);
  const router = useRouter();

  useEffect(async () => {
    if (!window.localStorage.selected) {
      router.push("/store");
      return;
    }
    const selectedItems = JSON.parse(window.localStorage.selected);
    const prevPath = window.localStorage.prevpath;
    setPrevPath(prevPath);

    const findCartInfo = (product) => {
      const findInfo = selectedItems.filter((obj) => {
        return obj.productId === product._id;
      });
      return findInfo[0];
    };

    try {
      const res = await axios.get("/api/products/");
      const { productData } = res.data;

      const selectedProducts = selectedItems.map((obj) => {
        const result = productData.filter((item) => obj.productId === item._id);
        return result[0];
      });

      const inactiveItems = selectedProducts.filter((product) => {
        return product.stockQty < findCartInfo(product)?.quantity;
      });

      if (inactiveItems[0]) {
        try {
          const res = await axios.post("/api/products/update", {
            inactiveItems,
          });

          if (typeof window !== "undefined") {
            localStorage.clear();
          }
          if (!res.data.empty) {
            router.push("/cart");
          }

          const newSelected = res.data.newSelected.filter((item) => {
            const deItems = selectedItems.filter(
              (obj) => item.productId === obj.productId
            );
            return deItems[0];
          });
          setSelected(newSelected);
          getSelectedTotal(newSelected);
        } catch (err) {
          console.log(err.message);
          console.log(err.response?.data);
          throw new Error(err.message);
        }
      } else {
        setSelected(selectedItems);
        getSelectedTotal(selectedItems);
      }

      setProducts(selectedProducts);
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, []);

  const handleOrder = async () => {
    try {
      const res = await axios.get("/api/products/");
      const { productData } = res.data;
      const selectedProducts = selected.map((obj) => {
        const result = productData.filter((item) => obj.productId === item._id);
        return result[0];
      });

      const inactiveItems = selectedProducts.filter((product) => {
        return product.stockQty < findCartInfo(product)?.quantity;
      });

      if (inactiveItems[0]) {
        window.location.reload();
        return;
      }
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
      throw new Error(err.message);
    }

    const subtotal = selected.map((item) => item.price * item.quantity);
    const result = subtotal.reduce((partialSum, a) => partialSum + a, 0);
    const newDate = new Date().toISOString();
    const newOrder = {
      orderDate: newDate,
      doneStatus: false,
      itemList: selected,
      totalPrice: result,
      totalQty: getSelectedQty(),
      paymentMethod: payment,
      customerName: user.name,
      customerId: user.userId,
      note: note,
    };

    try {
      await axios.post("/api/order/add", {
        newOrder,
        prevPath,
      });
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      setClicked(true);
      setTimeout(() => {
        router.push("/transaction");
      }, 5000);
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  };

  const findCartInfo = (product) => {
    const findInfo = selected.filter((obj) => obj.productId === product._id);
    return findInfo[0];
  };

  const getSelectedTotal = (arr = selected) => {
    const subtotal = arr.map((item) => item.price * item.quantity);
    const result = subtotal.reduce((partialSum, a) => partialSum + a, 0);
    setSubtotal(formatter.format(result));
  };

  const getSelectedQty = (arr = selected) => {
    const totalQty = arr.map((item) => item.quantity);
    const result = totalQty.reduce((partialSum, a) => partialSum + a, 0);
    return result;
  };

  return (
    <Container
      sx={{
        pt: 12,
        pb: 5,
        minHeight: "120vh",
      }}
      maxWidth="lg"
    >
      {products && !clicked && (
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
                    Total Payment
                  </Typography>
                  <Typography variant={stacks ? "body1" : "h6"} component="p">
                    {subtotal}
                  </Typography>
                </Box>
              </Box>
              <Box className="f-row">
                <Button
                  sx={{ mr: 0.5 }}
                  variant="contained"
                  onClick={(e) => {
                    e.target.disabled = true;
                    handleOrder();
                  }}
                  size={stacks ? "small" : "large"}
                >
                  Order
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}
      {products && !clicked && (
        <Box className="f-row" variant="outlined">
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
                Checkout
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              {products.map((product) => {
                return (
                  <Box
                    sx={{
                      cursor: "pointer",
                    }}
                    key={product._id}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        backgroundColor: `${
                          product.stockQty === 0 ? "#aaa" : "transparent"
                        }`,
                      }}
                    >
                      <CardContent className={switchNav ? "f-col" : "f-space"}>
                        <Box className="f-row">
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
                              px: 1,
                              flex: 1,
                              width: `${matches ? "9rem" : "auto"}`,
                            }}
                          >
                            <Typography
                              variant="body1"
                              component="h2"
                              noWrap={matches ? true : false}
                              sx={{ width: "100%" }}
                            >
                              {product.name}
                            </Typography>
                            <Box
                              sx={{ display: "flex", alignItems: "flex-end" }}
                            >
                              <Typography component="p" fontWeight={"bold"}>
                                {formatter.format(findCartInfo(product).price)}
                              </Typography>
                              <Typography
                                sx={{
                                  ml: 1,
                                  mb: 0.25,
                                }}
                                variant="caption"
                                component="p"
                              >
                                {`(${findCartInfo(product).quantity} pcs)`}
                              </Typography>
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
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
              }}
            >
              <Typography
                style={{
                  marginRight: `${matches ? "0" : "2rem"}`,
                }}
                variant={stacks ? "caption" : "body1"}
              >
                Note
              </Typography>
              <FormControl sx={{ textAlign: "right", width: "50%" }}>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  size="small"
                  style={{
                    textAlign: "right",
                    fontSize: "0.9rem",
                    letterSpacing: "0.25px",
                    border: "none",
                    outline: "none",
                  }}
                  placeholder="Type your note here"
                />
              </FormControl>
            </Card>
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
              }}
            >
              <Typography
                style={{
                  marginRight: `${matches ? "0" : "2rem"}`,
                }}
                variant={stacks ? "caption" : "body1"}
              >
                Payment Method
              </Typography>
              <FormControl sx={{ textAlign: "right" }}>
                <Select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  variant="standard"
                >
                  {paymentList.map((paymentName) => {
                    return (
                      <MenuItem value={paymentName} key={paymentName}>
                        <Typography
                          sx={{ mr: 5 }}
                          variant={stacks ? "caption" : "body1"}
                          component="p"
                        >
                          {paymentName}
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Card>
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
              }}
            >
              <Typography
                style={{
                  marginRight: `${matches ? "0" : "2rem"}`,
                }}
                variant={stacks ? "caption" : "body1"}
              >
                Total Order {`(${getSelectedQty()} Items)`}
              </Typography>
              <Typography
                sx={{ textAlign: "right" }}
                variant={stacks ? "caption" : "body1"}
              >
                {subtotal}
              </Typography>
            </Card>
          </Box>
        </Box>
      )}
      {clicked && (
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
              Transaction Success
            </Typography>
            <Typography
              sx={{ lineHeight: "125%" }}
              variant={matches ? "p" : "h6"}
              component="p"
              gutterBottom
            >
              Please communicate on Whatsapp for further information{" "}
            </Typography>
            <Typography
              sx={{ lineHeight: "125%" }}
              variant={matches ? "p" : "h6"}
              component="p"
              gutterBottom
            >
              Redirecting you to your transaction list in 5 seconds...
            </Typography>
            <img
              className="svg-login"
              src="/svg-success-order.svg"
              alt="svg-not-found"
            />
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Checkout;

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
