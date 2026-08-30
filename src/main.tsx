import React from "react";
import ReactDOM from "react-dom/client";
import CustomerLayout from "../app/layout";
import "../styles/customer.css";
import "./realtime";

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode><CustomerLayout/></React.StrictMode>,
);
