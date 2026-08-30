import React from "react";
import ReactDOM from "react-dom/client";
import OnlineHome from "../app/page";
import BarcodeMenu from "../app/layout";
import AdminDashboard from "../components/admin/AdminDashboard";
import {installDeliveryVerification} from "./deliveryVerification";
import "../app/globals.css";
import "../styles/service.css";
import "../styles/delivery-verification.css";
import "../styles/admin-dashboard.css";
import "./realtime";

const params=new URLSearchParams(location.search);
const table=params.get("table")||"";
const view=params.get("view");
const isBarcodeTable=/^[A-Za-z0-9-]{1,12}$/.test(table)&&!view;
const isCustomerOnline=!table&&!view;
const isAdmin=view==="admin";

if(isBarcodeTable){
 void import("../styles/customer.css");
 void import("../styles/book-black.css");
}

function installPngDownloadFix(){
 document.addEventListener("click",async event=>{
  const target=event.target as Element|null;
  const link=target?.closest?.('a[download][href^="data:image/png"]') as HTMLAnchorElement|null;
  if(!link)return;
  event.preventDefault();
  try{
   const response=await fetch(link.href);
   const blob=await response.blob();
   const objectUrl=URL.createObjectURL(blob);
   const download=document.createElement("a");
   download.href=objectUrl;
   download.download=link.download||"Xiao-Xiannu-QR.png";
   download.style.display="none";
   document.body.appendChild(download);
   download.click();
   download.remove();
   window.setTimeout(()=>URL.revokeObjectURL(objectUrl),2000);
  }catch(error){
   console.error("[QR Download] Failed",error);
   window.open(link.href,"_blank","noopener,noreferrer");
  }
 });
}

function installCustomerOnlyNavigation(){
 if(!isCustomerOnline)return;
 const clean=()=>{
  document.querySelectorAll<HTMLButtonElement>("button").forEach(button=>{
   const label=(button.textContent||"").trim().toLowerCase();
   if(label==="admin"||label==="driver")button.style.display="none";
   if(label==="track")button.textContent="Tracking";
  });
  document.querySelectorAll<HTMLElement>('[role="tab"]').forEach(tab=>{
   const label=(tab.textContent||"").trim().toLowerCase();
   if(label==="admin"||label==="driver")tab.style.display="none";
   if(label==="track")tab.textContent="Tracking";
  });
 };
 clean();
 new MutationObserver(clean).observe(document.body,{childList:true,subtree:true});
}

installPngDownloadFix();
installCustomerOnlyNavigation();
installDeliveryVerification();

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode>{isAdmin?<AdminDashboard/>:isBarcodeTable?<BarcodeMenu/>:<OnlineHome/>}</React.StrictMode>,
);
