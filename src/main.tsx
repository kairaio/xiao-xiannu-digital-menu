import React from "react";
import ReactDOM from "react-dom/client";
import CustomerLayout from "../app/layout";
import OperationsHome from "../app/page";
import "../app/globals.css";
import "../styles/customer.css";
import "./realtime";

const view=new URLSearchParams(location.search).get("view");
const operations=view==="admin"||view==="driver";

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode>{operations?<OperationsHome/>:<CustomerLayout/>}</React.StrictMode>,
);
