import React from "react";
import ReactDOM from "react-dom/client";
import OnlineHome from "../app/page";
import BarcodeMenu from "../app/layout";
import {AdminServiceRequests} from "../components/service/AdminServiceRequests";
import "../app/globals.css";
import "../styles/service.css";
import "./realtime";

const params=new URLSearchParams(location.search);
const table=params.get("table")||"";
const view=params.get("view");
const isBarcodeTable=/^[A-Za-z0-9-]{1,12}$/.test(table)&&!view;

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

function installAdminStatusOptions(){
 const enhance=()=>{
  document.querySelectorAll(".admin-controls select").forEach(node=>{
   const select=node as HTMLSelectElement;
   const ready=[...select.options].find(option=>option.value==="Ready for Delivery");
   if(ready)ready.textContent="Ready";
   const served=[...select.options].find(option=>option.value==="Delivered");
   if(served)served.textContent="Served";
   if(![...select.options].some(option=>option.value==="Paid")){
    const paid=document.createElement("option");
    paid.value="Paid";
    paid.textContent="Selesai Dibayar";
    select.appendChild(paid);
   }
  });
 };
 enhance();
 new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
}

function mountAdminServiceRequests(){
 if(view!=="admin")return;
 let attempts=0;
 const mount=()=>{
  const workspace=document.querySelector(".workspace");
  if(!workspace){if(attempts++<30)window.setTimeout(mount,100);return}
  if(document.getElementById("xx-admin-service-requests"))return;
  const host=document.createElement("div");
  host.id="xx-admin-service-requests";
  const qr=workspace.querySelector(".table-qr-panel");
  if(qr?.parentElement)qr.insertAdjacentElement("afterend",host);else workspace.prepend(host);
  ReactDOM.createRoot(host).render(<React.StrictMode><AdminServiceRequests/></React.StrictMode>);
 };
 window.setTimeout(mount,0);
}

installPngDownloadFix();
installAdminStatusOptions();

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode>{isBarcodeTable?<BarcodeMenu/>:<OnlineHome/>}</React.StrictMode>,
);
mountAdminServiceRequests();
