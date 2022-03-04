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

const Transactions = ({ user }) => {
  const switchNav = useMediaQuery("(max-width:900px)");
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(async () => {
    try {
      const res = await axios.get("/api/data/order");
      const { orderData, productData } = res.data;

      for (const order of orderData) {
        const firstProduct = productData.filter(
          (product) => product._id === order.itemList[0].productId
        );
        order.firstItemInfo = order.itemList[0];
        order.firstItem = firstProduct[0];
        order.productQty = order.itemList.length;
      }

      console.log(orderData);

      setOrders(orderData);
      setProducts(productData);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const handleOrder = async () => {
    const subtotal = selected.map((item) => item.price * item.quantity);
    const result = subtotal.reduce((partialSum, a) => partialSum + a, 0);
    //
    const newDate = new Date();
    // const newDate = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
    const newOrder = {
      orderDate: newDate,
      itemList: selected,
      totalPrice: result,
      paymentMethod: payment,
      customerName: user.name,
      customerId: user.userId,
      note: note,
    };
    console.log(newOrder);
    console.log(prevPath);

    try {
      const res = await axios.post("/api/orders/add", {
        newOrder,
        prevPath,
      });
      console.log(res);
      router.push("/store");
    } catch (err) {
      console.log(err.message);
      console.log(err.response.data);
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
      {orders && (
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
                Transaction List
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              {orders.map((order) => {
                return (
                  <Box
                    sx={{
                      cursor: "pointer",
                    }}
                    key={order._id}
                  >
                    <Card variant="outlined">
                      <CardContent className="f-col">
                        <Box
                          // className="f-row"
                          sx={{ display: "flex", alignItems: "flex-start" }}
                        >
                          <Box>
                            <img
                              src={order.firstItem.image[0]}
                              alt={`${order.firstItem.name}-img`}
                              style={{
                                width: `${
                                  stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                }`,
                                height: `${
                                  stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                }`,
                                margin: "0 .5rem",
                                opacity: `${
                                  order.firstItem.stockQty === 0 ? 0.7 : 1
                                }`,
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              px: 1,
                              mt: 1,
                              width: `${matches ? "9rem" : "auto"}`,
                            }}
                          >
                            <Typography
                              variant="body1"
                              component="h2"
                              noWrap
                              sx={{ width: "100%" }}
                            >
                              {order.firstItem.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex-col",
                                alignItems: "flex-end",
                              }}
                            >
                              <Typography variant="caption" component="p">
                                {order.itemList[0].quantity} pcs x{" "}
                                {formatter.format(order.itemList[0].price)}
                              </Typography>

                              {order.productQty > 1 && (
                                <Typography variant="caption" component="p">
                                  + {order.productQty - 1} other product
                                </Typography>
                              )}
                            </Box>
                            {/* <Typography variant="caption" component="p">
                              Total:{" "}
                              {formatter.format(
                                order.itemList[0].price *
                                  order.itemList[0].quantity
                              )}
                            </Typography> */}
                          </Box>
                        </Box>
                        <Box></Box>
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
              {/* <Typography
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
              </Typography> */}
            </Card>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Transactions;

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
