import React from "react";
import ReactDOM from "react-dom/client";
import OnlineHome from "../app/page";
import BarcodeMenu from "../app/layout";
import "../app/globals.css";
import "./realtime";

const params=new URLSearchParams(location.search);
const table=params.get("table")||"";
const view=params.get("view");
const isBarcodeTable=/^[A-Za-z0-9-]{1,12}$/.test(table)&&!view;

if(isBarcodeTable) void import("../styles/customer.css");

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode>{isBarcodeTable?<BarcodeMenu/>:<OnlineHome/>}</React.StrictMode>,
);
