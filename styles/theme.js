import { createTheme } from "@mui/material/styles";
import { lightGreen } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: lightGreen[900],
    },
    secondary: {
      main: "#fff",
    },

    typography: {
      fontWeightLight: 400,
      fontWeightRegular: 500,
      fontWeightMedium: 600,
    },
  },
});

export default theme;
