import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: red[800],
    },
    secondary: {
      main: "#fff",
    },

    typography: {
      fontFamily: "Nunito",
      fontWeightLight: 400,
      fontWeightRegular: 500,
      fontWeightMedium: 600,
    },
  },
});

export default theme;
