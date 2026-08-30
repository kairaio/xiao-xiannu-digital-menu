import React from "react";
import ReactDOM from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";
import "./realtime";

function customerQrExperience(){
 const style=document.createElement("style");
 style.textContent=`
  .checkout .form-grid,.checkout label:has(input[type="time"]){display:none!important}
  .checkout .type-option:has(input[value="Delivery"]){display:none!important}
  .checkout .type-grid{grid-template-columns:1fr 1fr!important}
  .checkout .qr-extra{display:grid;gap:14px;margin:4px 0 8px}
  .checkout .qr-extra h3{margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
  .checkout .qr-pack{display:flex;align-items:center;gap:10px;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px}
  .checkout .qr-pack input{width:18px;height:18px}
  .checkout .qr-help{display:block;opacity:.58;font-size:12px;margin-top:5px}
  .tracking-tools,.send-panel{display:none!important}
  .tracking-details>div:first-child h2,.tracking-details>div:first-child p{display:none!important}
  .qr-order-more{margin-top:18px;width:100%;padding:14px 18px;border-radius:999px;border:0;font-weight:800;cursor:pointer}
 `;
 document.head.appendChild(style);
 const clean=()=>{
  document.querySelectorAll("button").forEach(button=>{
   const label=(button.textContent||"").trim().toLowerCase();
   if(label==="admin"||label==="driver") button.style.display="none";
   if(label==="track") button.textContent="Order";
   if(label==="generate order") button.textContent="CONFIRM ORDER";
  });
  const checkout=document.querySelector("form.checkout");
  if(checkout){
   const h2=checkout.querySelector(".modal-title h2"); if(h2)h2.textContent="CONFIRM YOUR ORDER";
   const eyebrow=checkout.querySelector(".modal-title .eyebrow"); if(eyebrow)eyebrow.textContent="ORDER TYPE";
   checkout.querySelectorAll(".type-option").forEach(option=>{if((option.textContent||"").trim()==="Pickup") option.childNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE)n.textContent="Take Away"})});

   // Customer name and phone are intentionally hidden in QR-table checkout.
   // They must not keep native HTML required validation, otherwise the hidden
   // fields block the React form submit before CONFIRM ORDER can run.
   checkout.querySelectorAll(".form-grid input[required]").forEach(input=>{
    (input as HTMLInputElement).required=false;
    input.removeAttribute("required");
   });

   const tableInput=[...checkout.querySelectorAll("input")].find(i=>(i.parentElement?.textContent||"").includes("Table Number")) as HTMLInputElement|undefined;
   if(tableInput){
    const label=tableInput.parentElement;
    if(label){
     label.childNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE&&n.textContent?.includes("Table Number"))n.textContent="TABLE NUMBER *"});
     if(!label.querySelector(".qr-help")){
      const s=document.createElement("small");s.className="qr-help";s.textContent="Auto detected from QR";label.appendChild(s);
     }
    }
   }

   const notes=[...checkout.querySelectorAll("textarea")].at(-1) as HTMLTextAreaElement|undefined;
   if(notes){
    notes.placeholder="Additional request...";
    const label=notes.parentElement;
    if(label)label.childNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE)n.textContent="NOTE "});
   }

   if(!checkout.querySelector(".qr-extra")){
    const total=checkout.querySelector(".checkout-total");
    const extra=document.createElement("div");
    extra.className="qr-extra";
    extra.innerHTML='<h3>TAKE AWAY</h3><label class="qr-pack"><input type="checkbox" id="pack-takeaway"> <span>Pack this order as Take Away<small class="qr-help">Optional</small></span></label>';
    total?.parentElement?.insertBefore(extra,total);
   }
  }

  document.querySelectorAll(".timeline span").forEach(span=>{
   if(span.textContent==="Ready to Serve"||span.textContent==="Ready for Pickup")span.textContent="Ready";
   if(span.textContent==="Picked Up")span.textContent="Served";
  });

  const tracking=document.querySelector(".tracking-bottom");
  if(tracking&&!tracking.querySelector(".qr-order-more")){
   const button=document.createElement("button");
   button.className="qr-order-more primary";
   button.textContent="+ ORDER MORE";
   button.onclick=()=>{
    history.replaceState(null,"",location.pathname+location.search.replace(/([?&])view=track(&|$)/,"$1").replace(/([?&])order=[^&]+/,""));
    location.reload();
   };
   tracking.appendChild(button);
  }
 };
 clean();
 new MutationObserver(clean).observe(document.body,{childList:true,subtree:true});
}

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode><Home/></React.StrictMode>,
);
window.setTimeout(customerQrExperience,0);
