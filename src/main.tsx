import React from "react";
import ReactDOM from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";
import "./realtime";

function hideOperationsNavigation(){
 const clean=()=>{
  document.querySelectorAll("button").forEach(button=>{
   const label=(button.textContent||"").trim().toLowerCase();
   if(label==="admin"||label==="driver") button.style.display="none";
   if(label==="track") button.textContent="Order";
  });
 };
 clean();
 const observer=new MutationObserver(clean);
 observer.observe(document.body,{childList:true,subtree:true});
}

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode><Home/></React.StrictMode>,
);

window.setTimeout(hideOperationsNavigation,0);
