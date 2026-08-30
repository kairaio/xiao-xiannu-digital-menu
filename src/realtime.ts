import {createClient} from "@supabase/supabase-js";

const SUPABASE_URL="https://tgmnctkbcwgdkgpccwsw.supabase.co";
const SUPABASE_KEY="sb_publishable_Cy2VOIhTV4aK6I__HvW8Sw_MxU1mTk7";
const STORAGE_KEY="xx-orders";

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{realtime:{params:{eventsPerSecond:10}}});

type LocalOrder={number:string;customer:string;phone:string;type:string;address:string;location:string;table:string;requestedTime:string;notes:string;deliveryFee:number;items:unknown[];subtotal:number;total:number;status:string;driver:string;createdAt:string};

type DbOrder={number:string;customer:string;phone:string;order_type:string;address:string;location:string;table_number:string;requested_time:string;notes:string;delivery_fee:number;items:unknown[];subtotal:number;total:number;status:string;driver:string;created_at:string};

const toDb=(o:LocalOrder)=>({
 number:o.number,customer:o.customer,phone:o.phone,order_type:o.type,address:o.address||"",location:o.location||"",table_number:o.table||"",requested_time:o.requestedTime||"",notes:o.notes||"",delivery_fee:Number(o.deliveryFee)||0,items:o.items||[],subtotal:Number(o.subtotal)||0,total:Number(o.total)||0,status:o.status||"Order Received",driver:o.driver||"Unassigned",created_at:o.createdAt||new Date().toISOString()
});
const fromDb=(o:DbOrder):LocalOrder=>({
 number:o.number,customer:o.customer,phone:o.phone,type:o.order_type,address:o.address||"",location:o.location||"",table:o.table_number||"",requestedTime:o.requested_time||"",notes:o.notes||"",deliveryFee:Number(o.delivery_fee)||0,items:Array.isArray(o.items)?o.items:[],subtotal:Number(o.subtotal)||0,total:Number(o.total)||0,status:o.status,driver:o.driver||"Unassigned",createdAt:o.created_at
});
const readLocal=():LocalOrder[]=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return[]}};
let remoteWrite=false;
let lastSnapshot="";
const writeLocal=(orders:LocalOrder[])=>{remoteWrite=true;localStorage.setItem(STORAGE_KEY,JSON.stringify(orders));lastSnapshot=JSON.stringify(orders);window.dispatchEvent(new Event("storage"));remoteWrite=false};

async function pullOrders(){
 const {data,error}=await supabase.from("orders").select("*").order("created_at",{ascending:false});
 if(error){console.error("[Supabase] pull orders failed",error);return}
 const incoming=(data||[]).map(fromDb);
 if(JSON.stringify(incoming)!==JSON.stringify(readLocal()))writeLocal(incoming);
}

async function pushOrders(orders:LocalOrder[]){
 if(!orders.length)return;
 const {error}=await supabase.from("orders").upsert(orders.map(toDb),{onConflict:"number"});
 if(error)console.error("[Supabase] push orders failed",error);
}

function installLocalStorageBridge(){
 lastSnapshot=localStorage.getItem(STORAGE_KEY)||"[]";
 window.setInterval(()=>{
  if(remoteWrite)return;
  const current=localStorage.getItem(STORAGE_KEY)||"[]";
  if(current===lastSnapshot)return;
  lastSnapshot=current;
  pushOrders(readLocal());
 },500);
}

async function requestAdminNotifications(){
 if(!("Notification" in window))return;
 if(Notification.permission==="default"){
  const view=new URLSearchParams(location.search).get("view");
  if(view==="admin")await Notification.requestPermission();
 }
}
function notifyOrder(order:LocalOrder){
 if(!("Notification" in window)||Notification.permission!=="granted")return;
 new Notification(`New order #${order.number}`,{body:`${order.customer} · ${order.type} · $${Number(order.total).toFixed(2)}`,tag:`order-${order.number}`});
}

function installRealtime(){
 supabase.channel("xiao-xiannu-orders")
  .on("postgres_changes",{event:"INSERT",schema:"public",table:"orders"},payload=>{const order=fromDb(payload.new as DbOrder);notifyOrder(order);pullOrders()})
  .on("postgres_changes",{event:"UPDATE",schema:"public",table:"orders"},()=>pullOrders())
  .on("postgres_changes",{event:"DELETE",schema:"public",table:"orders"},()=>pullOrders())
  .subscribe();

 supabase.channel("xiao-xiannu-driver-locations")
  .on("postgres_changes",{event:"*",schema:"public",table:"driver_locations"},()=>window.dispatchEvent(new CustomEvent("xx-driver-location")))
  .subscribe();
}

let gpsWatch:number|null=null;
function currentView(){return new URLSearchParams(location.search).get("view")||"menu"}
function activeDeliveryOrders(){return readLocal().filter(o=>o.type==="Delivery"&&!['Delivered','Rejected'].includes(o.status)&&o.driver&&o.driver!=="Unassigned")}
function startDriverGps(){
 if(currentView()!=="driver"||gpsWatch!==null||!("geolocation" in navigator))return;
 gpsWatch=navigator.geolocation.watchPosition(async pos=>{
  const targets=activeDeliveryOrders();
  if(!targets.length)return;
  const rows=targets.map(o=>({order_number:o.number,latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy,heading:pos.coords.heading,speed:pos.coords.speed,updated_at:new Date().toISOString()}));
  const {error}=await supabase.from("driver_locations").upsert(rows,{onConflict:"order_number"});
  if(error)console.error("[Supabase] GPS update failed",error);
 },err=>console.warn("[GPS]",err.message),{enableHighAccuracy:true,maximumAge:5000,timeout:15000});
}
function stopDriverGps(){if(gpsWatch!==null){navigator.geolocation.clearWatch(gpsWatch);gpsWatch=null}}
function watchView(){
 const check=()=>{if(currentView()==="driver")startDriverGps();else stopDriverGps()};
 check();window.addEventListener("popstate",check);window.setInterval(check,1500);
}

async function renderLiveGps(){
 const q=new URLSearchParams(location.search),view=q.get("view"),number=q.get("order");
 if(view!=="track"||!number)return;
 const {data}=await supabase.from("driver_locations").select("*").eq("order_number",number).maybeSingle();
 let badge=document.getElementById("xx-live-gps");
 if(!badge){badge=document.createElement("a");badge.id="xx-live-gps";Object.assign(badge.style,{position:"fixed",right:"14px",bottom:"82px",zIndex:"9999",background:"#c9a96e",color:"#111",padding:"10px 14px",borderRadius:"999px",fontWeight:"800",fontSize:"12px",textDecoration:"none",boxShadow:"0 8px 30px rgba(0,0,0,.35)"});document.body.appendChild(badge)}
 if(data){badge.textContent="📍 Live driver GPS";(badge as HTMLAnchorElement).href=`https://www.google.com/maps?q=${data.latitude},${data.longitude}`;(badge as HTMLAnchorElement).target="_blank"}
 else{badge.textContent="GPS waiting for driver";(badge as HTMLAnchorElement).removeAttribute("href")}
}

async function boot(){
 installLocalStorageBridge();
 await pullOrders();
 await pushOrders(readLocal());
 installRealtime();
 requestAdminNotifications();
 watchView();
 renderLiveGps();
 window.addEventListener("xx-driver-location",renderLiveGps);
 window.setInterval(renderLiveGps,5000);
 console.info("[Xiao Xiannu] Supabase realtime online");
}

boot().catch(error=>console.error("[Xiao Xiannu] realtime boot failed",error));
