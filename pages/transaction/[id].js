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
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

// const idLocale = require("moment/locale/id");
// moment.locale("id", idLocale);

const DisplayOrder = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;
  // console.log(id);

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const switchNav = useMediaQuery("(max-width:900px)");
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  useEffect(async () => {
    const { id } = router.query;
    try {
      const res = await axios.post("/api/order/", { orderId: id });
      const { orderData, productData } = res.data;
      const orderedProductList = orderData.itemList.map((item) => {
        const orderedProducts = productData.filter(
          (product) => product._id === item.productId
        );
        const productObj = orderedProducts[0];
        productObj.orderedQty = item.quantity;
        productObj.orderedPrice = item.price;
        return productObj;
      });
      console.log(orderedProductList);
      setProducts(orderedProductList);

      console.log(orderData);
      setOrder(orderData);
    } catch (err) {
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, [id]);

  const getStatus = (order) => {
    if (order.finishDate === "-") {
      return "Canceled";
    } else if (order.doneStatus && order.finishDate !== "-") {
      return "Finished";
    } else {
      return "On Process";
    }
  };

  const getStyle = (order) => {
    if (order.finishDate === "-") {
      return {
        backgroundColor: "#ccc",
      };
    } else if (order.doneStatus && order.finishDate !== "-") {
      return {
        backgroundColor: "#58B24D",
        color: "#fff",
      };
    } else {
      return {
        backgroundColor: "#eee",
      };
    }
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
      {products && (
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
                Order Details
              </Typography>
            </Box>
            {order && (
              <Card
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1,
                  mt: 2,
                }}
              >
                <Typography
                  style={{
                    marginRight: `${matches ? "0" : "2rem"}`,
                  }}
                  variant={stacks ? "caption" : "body1"}
                  fontWeight="bold"
                >
                  Status
                </Typography>
                <Typography
                  variant="caption"
                  component="p"
                  className="main-title"
                  textAlign="center"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: "0.35vw",
                    // backgroundColor: getColor(order),
                  }}
                  style={getStyle(order)}
                >
                  {getStatus(order)}
                </Typography>
              </Card>
            )}
            <Box>
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
                                {formatter.format(product.orderedPrice)}
                              </Typography>
                              <Typography
                                sx={{
                                  ml: 1,
                                  mb: 0.25,
                                }}
                                variant="caption"
                                component="p"
                              >
                                {`(${product.orderedQty} pcs)`}
                              </Typography>
                            </Box>
                            <Typography variant="caption" component="p">
                              Total:{" "}
                              {formatter.format(
                                product.orderedPrice * product.orderedQty
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
            {order && (
              <>
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
                  <Typography variant={stacks ? "caption" : "body1"}>
                    Order Date
                  </Typography>
                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                  >
                    {moment(new Date(order.createdAt)).format("LLL")}
                  </Typography>
                </Card>

                {order.doneStatus && order.doneStatus !== "-" && (
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
                    <Typography variant={stacks ? "caption" : "body1"}>
                      Finish Date
                    </Typography>
                    <Typography
                      variant={stacks ? "caption" : "body1"}
                      textAlign="right"
                    >
                      {moment(new Date(order.finishDate)).format("LLL")}
                    </Typography>
                  </Card>
                )}

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
                  <Typography variant={stacks ? "caption" : "body1"}>
                    Note
                  </Typography>
                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                  >
                    {order.note ? order.note : "-"}
                  </Typography>
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
                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                  >
                    {order.paymentMethod}
                  </Typography>
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
                  <Typography variant={stacks ? "caption" : "body1"}>
                    Total Order {`(${order.totalQty} Items)`}
                  </Typography>
                  <Typography
                    sx={{ textAlign: "right" }}
                    variant={stacks ? "caption" : "body1"}
                  >
                    {formatter.format(order.totalPrice)}
                  </Typography>
                </Card>
              </>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default DisplayOrder;

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
