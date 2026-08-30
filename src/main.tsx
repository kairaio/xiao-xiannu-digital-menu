import React from "react";
import ReactDOM from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";
import "./realtime";

const params=new URLSearchParams(location.search);
const tableParam=params.get("table")||"";
const isTableQr=/^[A-Za-z0-9-]{1,12}$/.test(tableParam);

function setControlledInput(input:HTMLInputElement,value:string){
 const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set;
 setter?.call(input,value);
 input.dispatchEvent(new Event("input",{bubbles:true}));
 input.dispatchEvent(new Event("change",{bubbles:true}));
}

function replaceLabelText(element:Element,from:string,to:string){
 element.childNodes.forEach(node=>{
  if(node.nodeType===Node.TEXT_NODE&&node.textContent?.includes(from))node.textContent=node.textContent.replace(from,to);
 });
}

function installStyles(){
 const style=document.createElement("style");
 style.textContent=`
  .checkout.qr-table-checkout .form-grid{display:none!important}
  .checkout.qr-table-checkout .qr-hide{display:none!important}
  .checkout.qr-table-checkout .type-grid,.checkout.online-checkout .type-grid{grid-template-columns:1fr 1fr!important}
  .qr-table-checkout .qr-help{display:block;margin-top:5px;font-size:12px;opacity:.6}
  .qr-table-checkout .qr-pack-section{display:grid;gap:8px;margin:2px 0 4px}
  .qr-table-checkout .qr-pack-title{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
  .qr-table-checkout .qr-pack-option{display:flex!important;align-items:center;gap:10px;padding:13px 14px;border:1px solid rgba(255,255,255,.12);border-radius:12px}
  .qr-table-checkout .qr-pack-option input{width:18px;height:18px;accent-color:currentColor}
  .qr-table-checkout .qr-order-summary{display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(255,255,255,.12);font-weight:700}
  .qr-order-more{margin-top:18px;width:100%;padding:14px 18px;border-radius:999px;border:0;font-weight:800;cursor:pointer}
  body.qr-order-view .tracking-tools,body.qr-order-view .send-panel{display:none!important}
 `;
 document.head.appendChild(style);
}

function hideCustomerOperationsNavigation(){
 document.querySelectorAll<HTMLButtonElement>("button").forEach(button=>{
  const label=(button.textContent||"").trim().toLowerCase();
  if(label==="admin"||label==="driver")button.style.display="none";
  if(label==="track")button.textContent="Order";
 });
}

function processOnlineCheckout(form:HTMLFormElement){
 form.classList.add("online-checkout");
 form.querySelectorAll<HTMLElement>(".type-option").forEach(option=>{
  const label=(option.textContent||"").trim();
  if(label==="Dine-In")option.style.display="none";
 });
 const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]');
 if(submit)submit.textContent="CONFIRM ORDER";
}

function processQrCheckout(form:HTMLFormElement){
 form.classList.add("qr-table-checkout");
 const title=form.querySelector(".modal-title h2");
 if(title)title.textContent="CONFIRM YOUR ORDER";
 const eyebrow=form.querySelector(".modal-title .eyebrow");
 if(eyebrow)eyebrow.textContent="ORDER TYPE";

 const identityInputs=[...form.querySelectorAll<HTMLInputElement>(".form-grid input")];
 identityInputs.forEach(input=>{input.required=false;input.removeAttribute("required")});
 const nameInput=identityInputs[0];
 const phoneInput=identityInputs[1];
 if(phoneInput&&phoneInput.value!=="QR")setControlledInput(phoneInput,"QR");

 const typeOptions=[...form.querySelectorAll<HTMLElement>(".type-option")];
 const delivery=typeOptions.find(option=>(option.textContent||"").trim()==="Delivery");
 if(delivery)delivery.style.display="none";
 const pickup=typeOptions.find(option=>(option.textContent||"").trim()==="Pickup"||(option.textContent||"").trim()==="Take Away");
 if(pickup&&(pickup.textContent||"").trim()==="Pickup")replaceLabelText(pickup,"Pickup","Take Away");
 const dineIn=typeOptions.find(option=>(option.textContent||"").trim()==="Dine-In");

 const timeInput=form.querySelector<HTMLInputElement>('input[type="time"]');
 if(timeInput)timeInput.closest("label")?.classList.add("qr-hide");

 const tableInput=[...form.querySelectorAll<HTMLInputElement>("input")].find(input=>(input.closest("label")?.textContent||"").includes("Table Number"));
 if(tableInput){
  const label=tableInput.closest("label");
  if(label){
   replaceLabelText(label,"Table Number","TABLE NUMBER *");
   if(!label.querySelector(".qr-help")){
    const help=document.createElement("small");
    help.className="qr-help";
    help.textContent="Auto detected from QR";
    label.appendChild(help);
   }
  }
 }

 const note=form.querySelector<HTMLTextAreaElement>("textarea:last-of-type");
 if(note){
  note.placeholder="Additional request...";
  const label=note.closest("label");
  if(label){
   replaceLabelText(label,"Customer Notes","NOTE");
   if(!label.querySelector(".qr-note-help")){
    const help=document.createElement("small");
    help.className="qr-help qr-note-help";
    help.textContent="Optional";
    label.appendChild(help);
   }
  }
 }

 let pack=form.querySelector<HTMLInputElement>("#qr-pack-takeaway");
 if(!pack){
  const section=document.createElement("div");
  section.className="qr-pack-section";
  section.innerHTML='<span class="qr-pack-title">TAKE AWAY</span><label class="qr-pack-option"><input id="qr-pack-takeaway" type="checkbox"><span>Pack this order as Take Away<small class="qr-help">Optional</small></span></label>';
  const noteLabel=note?.closest("label");
  if(noteLabel)form.insertBefore(section,noteLabel);
  else form.querySelector(".checkout-total")?.parentElement?.insertBefore(section,form.querySelector(".checkout-total"));
  pack=section.querySelector<HTMLInputElement>("#qr-pack-takeaway")||undefined;
 }

 const count=(document.querySelector(".cart-button b")?.textContent||"0").trim();
 const total=form.querySelector(".checkout-total");
 if(total&&!form.querySelector(".qr-order-summary")){
  const summary=document.createElement("div");
  summary.className="qr-order-summary";
  summary.innerHTML=`<span>${count} Items</span><span>Table ${tableParam}</span>`;
  total.parentElement?.insertBefore(summary,total);
 }
 const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]');
 if(submit)submit.textContent="CONFIRM ORDER";

 const setQrIdentity=(mode:"Dine-In"|"Take Away")=>{
  if(!nameInput)return;
  if(mode==="Take Away")setControlledInput(nameInput,`QR Take Away · Table ${tableParam}`);
  else setControlledInput(nameInput,pack?.checked?`Table ${tableParam} · Pack Take Away`:`Table ${tableParam}`);
 };

 if(!form.dataset.qrHandlers){
  form.dataset.qrHandlers="1";
  dineIn?.addEventListener("click",()=>window.setTimeout(()=>{
   const section=form.querySelector<HTMLElement>(".qr-pack-section");
   if(section)section.style.display="grid";
   setQrIdentity("Dine-In");
  },0));
  pickup?.addEventListener("click",()=>window.setTimeout(()=>{
   const section=form.querySelector<HTMLElement>(".qr-pack-section");
   if(section)section.style.display="none";
   setQrIdentity("Take Away");
  },0));
  pack?.addEventListener("change",()=>setQrIdentity("Dine-In"));
 }

 const selectedPickup=pickup?.querySelector('[data-state="checked"],button[aria-checked="true"]');
 if(selectedPickup){
  const section=form.querySelector<HTMLElement>(".qr-pack-section");
  if(section)section.style.display="none";
  setQrIdentity("Take Away");
 }else{
  const section=form.querySelector<HTMLElement>(".qr-pack-section");
  if(section)section.style.display="grid";
  if(nameInput&&!nameInput.value)setQrIdentity("Dine-In");
 }
}

function processTracking(){
 const tracking=document.querySelector<HTMLElement>(".tracking-bottom");
 if(!tracking)return;
 const details=tracking.querySelector<HTMLElement>(".tracking-details");
 const customer=details?.querySelector("h2")?.textContent||"";
 const fulfillment=document.querySelector<HTMLElement>(".fulfillment-panel h2")?.textContent||"";
 const qrTakeAway=/^QR Take Away · Table /.test(customer);
 const qrDineIn=/^Table [A-Za-z0-9-]+$/.test(fulfillment);
 if(!qrTakeAway&&!qrDineIn)return;

 document.body.classList.add("qr-order-view");
 document.querySelectorAll<HTMLElement>(".timeline span").forEach(span=>{
  if(span.textContent==="Ready to Serve"||span.textContent==="Ready for Pickup")span.textContent="Ready";
  if(span.textContent==="Picked Up")span.textContent="Served";
 });

 if(!tracking.querySelector(".qr-order-more")){
  const table=qrTakeAway?(customer.match(/Table ([A-Za-z0-9-]+)/)?.[1]||tableParam):(fulfillment.match(/Table ([A-Za-z0-9-]+)/)?.[1]||tableParam);
  const button=document.createElement("button");
  button.className="qr-order-more primary";
  button.textContent="+ ORDER MORE";
  button.onclick=()=>{location.href=`${location.pathname}?table=${encodeURIComponent(table)}#menu`};
  tracking.appendChild(button);
 }
}

function processAdminTakeAwayLabels(){
 document.querySelectorAll<HTMLElement>(".order-card").forEach(card=>{
  if(!card.textContent?.includes("QR Take Away · Table"))return;
  const type=card.querySelector("p b");
  if(type?.textContent==="Pickup")type.textContent="Take Away";
 });
}

function processPage(){
 hideCustomerOperationsNavigation();
 const form=document.querySelector<HTMLFormElement>("form.checkout");
 if(form){
  if(isTableQr)processQrCheckout(form);
  else processOnlineCheckout(form);
 }
 processTracking();
 processAdminTakeAwayLabels();
}

installStyles();
ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode><Home/></React.StrictMode>,
);
window.setTimeout(processPage,0);
new MutationObserver(processPage).observe(document.body,{childList:true,subtree:true});
