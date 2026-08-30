"use client";
import {useEffect,useMemo,useState} from "react";
import QRCode from "qrcode";
import {menu,categories} from "../../data/menu";
import {AdminServiceRequests} from "../service/AdminServiceRequests";

type Order={
 number:string;customer:string;phone:string;type:string;address:string;location:string;table:string;
 requestedTime:string;notes:string;deliveryFee:number;items:any[];subtotal:number;total:number;
 status:string;driver:string;createdAt:string;
};

type Tab="OVERVIEW"|"ORDERS"|"TABLES"|"SERVICE"|"DELIVERY"|"MENU"|"QR CODES"|"HISTORY"|"SETTINGS";
const TABS:Tab[]=["OVERVIEW","ORDERS","TABLES","SERVICE","DELIVERY","MENU","QR CODES","HISTORY","SETTINGS"];
const STORAGE_KEY="xx-orders";
const readOrders=():Order[]=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return[]}};
const statusOptions=[
 {value:"Confirmed",label:"Confirmed"},
 {value:"Preparing",label:"Preparing"},
 {value:"Ready for Delivery",label:"Ready"},
 {value:"Delivered",label:"Served"},
 {value:"Paid",label:"Selesai Dibayar"},
];
const statusLabel=(s:string)=>s==="Ready for Delivery"?"Ready":s==="Delivered"?"Served":s==="Paid"?"Selesai Dibayar":s;
const money=(n:number)=>`$${Number(n||0).toFixed(2)}`;

export default function AdminDashboard(){
 const params=new URLSearchParams(location.search);
 const initialOrder=params.get("order")||"";
 const [tab,setTab]=useState<Tab>(initialOrder?"ORDERS":"OVERVIEW");
 const [orders,setOrders]=useState<Order[]>(()=>readOrders());
 const [selectedOrder,setSelectedOrder]=useState(initialOrder);
 const [qrTable,setQrTable]=useState("08");
 const [qrData,setQrData]=useState("");
 const [historySearch,setHistorySearch]=useState("");
 const [settings,setSettings]=useState(()=>{try{return JSON.parse(localStorage.getItem("xx-admin-settings")||"{}") }catch{return {}}});

 useEffect(()=>{
  const sync=()=>setOrders(readOrders());
  window.addEventListener("storage",sync);
  const timer=window.setInterval(sync,1000);
  return()=>{window.removeEventListener("storage",sync);window.clearInterval(timer)};
 },[]);

 const writeOrders=(next:Order[])=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
  window.dispatchEvent(new Event("storage"));
  setOrders(next);
 };
 const patchOrder=(number:string,patch:Partial<Order>)=>writeOrders(orders.map(o=>o.number===number?{...o,...patch}:o));

 const active=useMemo(()=>orders.filter(o=>!["Paid","Rejected"].includes(o.status)),[orders]);
 const today=new Date().toDateString();
 const todayOrders=useMemo(()=>orders.filter(o=>new Date(o.createdAt).toDateString()===today),[orders,today]);
 const revenue=useMemo(()=>todayOrders.filter(o=>o.status==="Paid").reduce((sum,o)=>sum+Number(o.total||0),0),[todayOrders]);
 const tables=useMemo(()=>{
  const map=new Map<string,Order[]>();
  active.filter(o=>o.type==="Dine-In"&&o.table).forEach(o=>map.set(o.table,[...(map.get(o.table)||[]),o]));
  return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true}));
 },[active]);
 const deliveryOrders=useMemo(()=>orders.filter(o=>o.type==="Delivery"),[orders]);
 const history=useMemo(()=>orders.filter(o=>o.status==="Paid"||o.status==="Rejected"||(o.type==="Delivery"&&o.status==="Delivered")),[orders]);
 const filteredHistory=history.filter(o=>`${o.number} ${o.customer} ${o.table}`.toLowerCase().includes(historySearch.toLowerCase()));
 const selected=orders.find(o=>o.number===selectedOrder);

 useEffect(()=>{
  const base=`${location.origin}${location.pathname}?table=${encodeURIComponent(qrTable)}&theme=black`;
  QRCode.toDataURL(base,{width:720,margin:2}).then(setQrData).catch(()=>setQrData(""));
 },[qrTable]);

 const saveSettings=(next:any)=>{setSettings(next);localStorage.setItem("xx-admin-settings",JSON.stringify(next))};

 return <div className="xx-admin-shell">
  <header className="xx-admin-header">
   <div><div className="xx-admin-demo">DEMO</div><h1>Japanese Restaurant</h1><p>Admin Dashboard</p></div>
   <div className="xx-admin-live"><span>🔔 {active.length}</span><span className="xx-online-dot"/> Online</div>
  </header>

  <nav className="xx-admin-tabs">{TABS.map(name=><button key={name} className={tab===name?"active":""} onClick={()=>setTab(name)}>{name}</button>)}</nav>

  <main className="xx-admin-main">
   {tab==="OVERVIEW"&&<>
    <section className="xx-stat-grid">
     <Stat title="Orders Today" value={String(todayOrders.length)}/><Stat title="Revenue Today" value={money(revenue)}/>
     <Stat title="Active Orders" value={String(active.length)}/><Stat title="Active Tables" value={String(tables.length)}/>
    </section>
    <Panel title="Live Operations"><div className="xx-quick-grid">
     <button onClick={()=>setTab("ORDERS")}>Open Orders <b>{active.length}</b></button>
     <button onClick={()=>setTab("TABLES")}>Active Tables <b>{tables.length}</b></button>
     <button onClick={()=>setTab("SERVICE")}>Waiter / Bill Requests</button>
     <button onClick={()=>setTab("DELIVERY")}>Delivery <b>{deliveryOrders.filter(o=>!["Paid","Rejected","Delivered"].includes(o.status)).length}</b></button>
    </div></Panel>
    <Panel title="Latest Orders"><OrderTable orders={orders.slice(0,6)} onOpen={n=>{setSelectedOrder(n);setTab("ORDERS")}}/></Panel>
   </>}

   {tab==="ORDERS"&&<Panel title="Orders">
    <OrderTable orders={orders.filter(o=>!["Paid","Rejected"].includes(o.status))} onOpen={setSelectedOrder}/>
    {selected&&<div className="xx-order-detail">
     <div className="xx-order-detail-head"><div><small>ORDER</small><h3>#{selected.number}</h3></div><button onClick={()=>setSelectedOrder("")}>Close</button></div>
     <div className="xx-detail-grid"><span><b>{selected.customer}</b><small>{selected.phone}</small></span><span><b>{selected.type}</b><small>{selected.table?`Table ${selected.table}`:selected.address||"-"}</small></span><span><b>{money(selected.total)}</b><small>{new Date(selected.createdAt).toLocaleString()}</small></span></div>
     <div className="xx-items">{(selected.items||[]).map((item:any,i)=><div key={i}><span>{item.qty||1}× {item.name}</span><b>{money((item.price||0)*(item.qty||1))}</b></div>)}</div>
     <div className="xx-order-actions">
      <button onClick={()=>patchOrder(selected.number,{status:"Confirmed"})}>Accept</button>
      <button className="danger" onClick={()=>patchOrder(selected.number,{status:"Rejected"})}>Reject</button>
      <select value={selected.status} onChange={e=>patchOrder(selected.number,{status:e.target.value})}>{statusOptions.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select>
     </div>
    </div>}
   </Panel>}

   {tab==="TABLES"&&<Panel title="Tables">
    {tables.length?<div className="xx-table-grid">{tables.map(([tableNo,list])=>{
     const total=list.reduce((sum,o)=>sum+Number(o.total||0),0);return <button key={tableNo} onClick={()=>{setSelectedOrder(list[0].number);setTab("ORDERS")}}><span>TABLE</span><strong>{tableNo}</strong><small>{list.length} active order{list.length>1?"s":""}</small><b>{money(total)}</b></button>
    })}</div>:<Empty text="No active dine-in tables."/>}
   </Panel>}

   {tab==="SERVICE"&&<Panel title="Service Requests"><p className="xx-panel-note">Call Waiter and Request Bill are connected to the existing realtime service request system.</p><AdminServiceRequests/></Panel>}

   {tab==="DELIVERY"&&<Panel title="Delivery">
    {deliveryOrders.length?<div className="xx-delivery-list">{deliveryOrders.map(o=><article key={o.number}>
     <div><small>#{o.number}</small><h3>{o.customer}</h3><p>{o.address||"No address"}</p><span className="xx-status">{statusLabel(o.status)}</span></div>
     <div className="xx-delivery-actions">{o.location&&<a href={o.location} target="_blank" rel="noreferrer">Customer Location</a>}<a href={`?view=track&order=${encodeURIComponent(o.number)}`} target="_blank" rel="noreferrer">Live Tracking</a><button onClick={()=>{setSelectedOrder(o.number);setTab("ORDERS")}}>Manage</button></div>
    </article>)}</div>:<Empty text="No delivery orders yet."/>}
   </Panel>}

   {tab==="MENU"&&<Panel title="Menu">
    <div className="xx-menu-summary"><b>{menu.length}</b> menu items <span>·</span> <b>{categories.length}</b> categories</div>
    <p className="xx-panel-note">This list reads the same menu data used by the customer/table menu, so the dashboard reflects the current catalog.</p>
    <div className="xx-menu-list">{menu.map(item=><div key={item.id}><img src={item.image} alt=""/><span><b>{item.id} · {item.name}</b><small>{item.category}</small></span><strong>{money(item.price)} {item.unit||""}</strong></div>)}</div>
   </Panel>}

   {tab==="QR CODES"&&<Panel title="QR Codes">
    <div className="xx-qr-layout"><div><label>Table Number</label><input value={qrTable} maxLength={12} onChange={e=>setQrTable(e.target.value.replace(/[^A-Za-z0-9-]/g,""))}/><p>Each table opens its own ordering session.</p></div><div className="xx-qr-card">{qrData&&<img src={qrData} alt={`QR Table ${qrTable}`}/>}<b>TABLE {qrTable||"—"}</b>{qrData&&<a href={qrData} download={`Xiao-Xiannu-Table-${qrTable}.png`}>Download QR</a>}</div></div>
   </Panel>}

   {tab==="HISTORY"&&<Panel title="History">
    <input className="xx-search" placeholder="Search order, customer or table..." value={historySearch} onChange={e=>setHistorySearch(e.target.value)}/>
    <OrderTable orders={filteredHistory} onOpen={n=>{setSelectedOrder(n);setTab("ORDERS")}}/>
   </Panel>}

   {tab==="SETTINGS"&&<Panel title="Settings"><div className="xx-settings-grid">
    <label>Restaurant Name<input value={settings.restaurantName||"Japanese Restaurant"} onChange={e=>saveSettings({...settings,restaurantName:e.target.value})}/></label>
    <label>Opening Hours<input value={settings.openingHours||"24 Hours"} onChange={e=>saveSettings({...settings,openingHours:e.target.value})}/></label>
    <label>Delivery Fee<input type="number" value={settings.deliveryFee??0} onChange={e=>saveSettings({...settings,deliveryFee:Number(e.target.value)})}/></label>
    <label>Payment Methods<input value={settings.paymentMethods||"Cash / Transfer"} onChange={e=>saveSettings({...settings,paymentMethods:e.target.value})}/></label>
   </div><p className="xx-panel-note">Demo configuration is saved on this admin device.</p></Panel>}
  </main>
 </div>;
}

function Stat({title,value}:{title:string;value:string}){return <div className="xx-stat"><small>{title}</small><strong>{value}</strong></div>}
function Panel({title,children}:{title:string;children:any}){return <section className="xx-panel"><div className="xx-panel-title"><h2>{title}</h2><span>LIVE</span></div>{children}</section>}
function Empty({text}:{text:string}){return <div className="xx-empty">{text}</div>}
function OrderTable({orders,onOpen}:{orders:Order[];onOpen:(n:string)=>void}){return <div className="xx-order-table"><div className="xx-order-row head"><span>Order</span><span>Customer</span><span>Type / Table</span><span>Status</span><span>Total</span></div>{orders.length?orders.map(o=><button className="xx-order-row" key={o.number} onClick={()=>onOpen(o.number)}><span>#{o.number}</span><span>{o.customer||"Guest"}</span><span>{o.type}{o.table?` · T${o.table}`:""}</span><span><i className="xx-status">{statusLabel(o.status)}</i></span><span>{money(o.total)}</span></button>):<Empty text="No orders found."/>}</div>}
