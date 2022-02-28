import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Input,
  FormLabel,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  Grid,
  IconButton,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import InputAdornment from "@mui/material/InputAdornment";

const EditProduct = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;

  const [quantity, setQuantity] = useState({});
  const [product, setProduct] = useState(null);
  const [allProduct, setAllProduct] = useState([]);
  const [imgPath, setImgPath] = useState([]);
  const stacks = useMediaQuery("(max-width:450px)");
  const matches = useMediaQuery("(max-width:720px)");

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
            px: "calc(1rem + 2.5vw)",
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
            <Typography className="main-title" variant="h5" component="h2">
              Product Information
            </Typography>
            {product && (
              <Box className="f-row" sx={{ gap: 5 }}>
                <Box sx={{ flex: 1 }}>
                  <img src={product.image[0]} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography>{product.name}</Typography>
                    <Typography>
                      {formatter.format(product.price[0].price)}
                    </Typography>
                    <Typography>{product.category?.name}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      variant="standard"
                      required
                      sx={{
                        my: 2,
                        width: `${matches ? "100%" : "35%"}`,
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography>{product.desc}</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditProduct;

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
