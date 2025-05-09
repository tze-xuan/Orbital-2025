import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "@fontsource/darumadrop-one";
import "@fontsource/afacad";

const theme = extendTheme({
  initialColorMode: `light`,
  fonts: {
    darumadrop: "'Darumadrop One', sans-serif",
    afacad: "'Afacad', sans-serif",
  },
  semanticTokens: {
    colors: {
      "chakra-body-text": { _light: "#3E405B" },
      "chakra-placeholder-color": { _light: "#3E405B" },
    },
  },
  styles: {
    global: (props) => ({
      "html, body": {
        background: "#FEF1C5",
      },
    }),
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
