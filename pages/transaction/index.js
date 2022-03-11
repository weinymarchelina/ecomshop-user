import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import moment from "moment";

// const idLocale = require("moment/locale/id");
// moment.locale("id", idLocale);

const formatter = new Intl.NumberFormat("id", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const Transactions = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");
  const [orders, setOrders] = useState([]);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const filterList = [
    "Unfinished",
    "Finished",
    "Canceled",
    "Today",
    "This Week",
    "This Month",
  ];

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

        for (const item of order.itemList) {
          const product = productData.filter(
            (product) => product._id === item.productId
          );
          item.priceList = product[0].price;
        }
      }

      console.log(orderData);

      setOrders(orderData);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const filterOrders = () => {
    let filteredOrders;
    if (orders) {
      switch (filter) {
        case "Unfinished":
          filteredOrders = orders.filter((order) => !order.doneStatus);

          break;

        case "Finished":
          filteredOrders = orders.filter(
            (order) => order.doneStatus && order.finishDate !== "-"
          );

          break;

        case "Canceled":
          filteredOrders = orders.filter(
            (order) => order.doneStatus && order.finishDate === "-"
          );
          console.log(filteredOrders);
          break;

        case "Today":
          filteredOrders = orders.filter(
            (order) =>
              moment(new Date(order.createdAt)).format("LL") ===
              moment(new Date()).format("LL")
          );

          break;

        case "This Week":
          filteredOrders = orders.filter((order) => {
            const startDayOfPrevWeek = moment(new Date())
              .startOf("week")
              .format("lll");
            const lastDayOfPrevWeek = moment(new Date())
              .endOf("week")
              .format("lll");

            const orderDate = moment(new Date(order.createdAt)).format("lll");

            return moment(new Date(orderDate)).isBetween(
              startDayOfPrevWeek,
              lastDayOfPrevWeek
            );
          });

          break;

        case "This Month":
          filteredOrders = orders.filter((order) => {
            const startDayOfMonth = moment(new Date())
              .startOf("month")
              .format("lll");
            const lastDayOfMonth = moment(new Date())
              .endOf("month")
              .format("lll");

            const orderDate = moment(new Date(order.createdAt)).format("lll");

            return moment(new Date(orderDate)).isBetween(
              startDayOfMonth,
              lastDayOfMonth
            );
          });

          break;

        default:
          filteredOrders = orders;

          break;
      }
    } else {
      filteredOrders = orders;
    }

    return filteredOrders;
  };
  const newOrders = filterOrders();

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

  const handleBuy = async (order) => {
    console.log(order.itemList);
    try {
      const res = await axios.post("/api/order/again", {
        items: order.itemList,
      });

      console.log(res);
      router.push("/cart");
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

            {newOrders && (
              <Card variant="outlined" sx={{ mt: 3 }}>
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
                        value={filter}
                        label="Category"
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <MenuItem value="All">
                          <Typography variant="subtitle1" component="p">
                            All
                          </Typography>
                        </MenuItem>
                        {filterList.map((filter) => (
                          <MenuItem key={filter} value={filter}>
                            <Typography variant="subtitle1" component="p">
                              {filter}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            )}

            <Box sx={{ mt: 2 }}>
              {newOrders.map((order) => {
                return (
                  <Box key={order._id}>
                    <Card variant="outlined">
                      <CardContent
                        className="f-col"
                        sx={{ justifyContent: "center" }}
                      >
                        <Box
                          className={stacks ? "f-col" : "f-space"}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              opacity: 0.85,
                            },
                          }}
                          onClick={() =>
                            router.push(`/store/${order.firstItem._id}`)
                          }
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: `${stacks ? "center" : "flex-start"}`,
                              my: 2,
                            }}
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
                                  // opacity: `${
                                  //   order.firstItem.stockQty === 0 ? 0.7 : 1
                                  // }`,
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                px: 1,
                                mt: 1,
                                width: `${
                                  matches ? "calc(37.5vw + 5rem)" : "100%"
                                }`,
                              }}
                            >
                              <Typography
                                sx={{ mr: 3, fontSize: "0.6rem" }}
                                component="p"
                              >
                                {moment(order.createdAt).format("LLL")}
                              </Typography>
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
                                  <Typography
                                    variant="caption"
                                    component="p"
                                    sx={{ mt: 1 }}
                                  >
                                    + {order.productQty - 1} other product
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: `${
                                stacks ? "row-reverse" : "column"
                              }`,
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="caption"
                                component="p"
                                className="main-title"
                                textAlign="center"
                                sx={{
                                  fontSize: `${stacks ? "0.75rem" : "0.7rem"}`,
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: "0.35vw",
                                  // backgroundColor: getColor(order),
                                }}
                                style={getStyle(order)}
                              >
                                {getStatus(order)}
                              </Typography>
                            </Box>
                            <Box sx={{ mr: 2 }}>
                              <Typography
                                sx={{
                                  textTransform: "uppercase",
                                }}
                                variant="caption"
                                component="p"
                              >
                                Total
                              </Typography>
                              <Typography variant="p" fontWeight={500}>
                                {formatter.format(order.totalPrice)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box
                          // className="f-space"
                          sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                              size="small"
                              onClick={() =>
                                router.push(`/transaction/${order._id}`)
                              }
                            >
                              View Details
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={(e) => {
                                e.target.disabled = true;
                                console.log(e.target.disabled);
                                handleBuy(order);
                              }}
                            >
                              Buy Again
                            </Button>
                          </Box>
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

// for (const order of orderData) {
//   const firstProduct = productData.filter(
//     (product) => product._id === order.itemList[0].productId
//   );
//   order.firstItemInfo = order.itemList[0];
//   order.firstItem = firstProduct[0];
//   order.productQty = order.itemList.length;

//   for (const item of order.itemList) {
//     const product = productData.filter(
//       (product) => product._id === item.productId
//     );

//     const productNames = [];
//     productData.forEach((product) => {
//       if (
//         item.productId === product._id &&
//         !products.includes(product._id)
//       ) {
//         productNames.push(product.name);
//       }
//     });

//     console.log(productNames);
//     setProducts((prev) => [...prev, productNames]);

//     item.priceList = product[0].price;
//   }
// }
