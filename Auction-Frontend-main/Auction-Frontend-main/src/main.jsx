import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </HelmetProvider>,
);
