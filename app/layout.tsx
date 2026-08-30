import {useEffect,useMemo,useState} from "react";
import {Header} from "../components/layout/Header";
import {BottomNavigation} from "../components/layout/BottomNavigation";
import {BookCover} from "../components/book/BookCover";
import MenuPage from "./menu/page";
import ItemPage from "./item/[id]/page";
import CartPage from "./cart/page";
import OrderPage from "./order/[orderId]/page";
import {ConfirmOrder} from "../components/cart/ConfirmOrder";
import {getMenuItem} from "../data/menu";
import {detectTable} from "../store/tableStore";
import {clearCart,readCart,setItemNote,setItemQuantity} from "../store/cartStore";
import {createOrder,getOrder,readOrders,type StoredOrder} from "../store/orderStore";
import type {CartLine,MenuItem} from "../types/menu";

function readScreen(){return new URLSearchParams(location.search).get("screen")||"home"}
export default function CustomerLayout(){
 const[table]=useState(()=>detectTable()),[screen,setScreen]=useState(readScreen),[cart,setCart]=useState<CartLine[]>(()=>readCart()),[activeOrder,setActiveOrder]=useState<StoredOrder|null>(null);
 const q=new URLSearchParams(location.search),itemId=q.get("item")||"",orderId=q.get("order")||"";
 const item=useMemo(()=>getMenuItem(itemId),[itemId]);
 useEffect(()=>{const syncCart=()=>setCart(readCart());window.addEventListener("xx-cart-change",syncCart as EventListener);return()=>window.removeEventListener("xx-cart-change",syncCart as EventListener)},[]);
 useEffect(()=>{const syncOrder=()=>{const requested=new URLSearchParams(location.search).get("order");const orders=readOrders();const match=requested?getOrder(requested):(table?orders.find(o=>o.table===table):orders[0]);setActiveOrder(match||null)};syncOrder();window.addEventListener("storage",syncOrder);const timer=window.setInterval(syncOrder,2500);return()=>{window.removeEventListener("storage",syncOrder);window.clearInterval(timer)}},[table,screen]);
 const navigate=(next:string,extra:Record<string,string>={})=>{const params=new URLSearchParams();if(table)params.set("table",table);if(next!=="home")params.set("screen",next);Object.entries(extra).forEach(([k,v])=>v&&params.set(k,v));history.pushState(null,"",`${location.pathname}${params.toString()?`?${params}`:""}`);setScreen(next);window.scrollTo({top:0,behavior:"smooth"})};
 useEffect(()=>{const pop=()=>setScreen(readScreen());window.addEventListener("popstate",pop);return()=>window.removeEventListener("popstate",pop)},[]);
 const qty=(menuItem:MenuItem,n:number)=>setCart(setItemQuantity(menuItem,n));
 const note=(id:string,value:string)=>setCart(setItemNote(id,value));
 const cartCount=cart.reduce((sum,line)=>sum+line.qty,0);
 const goMain=(next:string)=>{if(next==="order"){const latest=activeOrder||readOrders().find(o=>!table||o.table===table)||readOrders()[0];navigate("order",latest?{order:latest.number}:{})}else navigate(next)};
 return <div className="customer-app"><Header table={table} cartCount={cartCount} onHome={()=>navigate("home")} onCart={()=>navigate("cart")}/><main className="customer-main">{screen==="home"&&<BookCover table={table} onOpen={()=>navigate("menu")}/>} {screen==="menu"&&<MenuPage cart={cart} onOpen={m=>navigate("item",{item:m.id})} onQty={qty}/>} {screen==="item"&&item&&<ItemPage item={item} line={cart.find(x=>x.id===item.id)} onBack={()=>navigate("menu")} onQty={n=>qty(item,n)} onNote={v=>{if(!cart.some(x=>x.id===item.id))qty(item,1);setTimeout(()=>note(item.id,v),0)}} onAdd={()=>{if(!cart.some(x=>x.id===item.id))qty(item,1);navigate("cart")}}/>} {screen==="cart"&&<CartPage table={table} cart={cart} onBack={()=>navigate("menu")} onQty={(line,n)=>qty(line,n)} onNote={note} onContinue={()=>cart.length&&navigate("confirm")}/>} {screen==="confirm"&&<ConfirmOrder initialTable={table} cart={cart} onCancel={()=>navigate("cart")} onConfirm={data=>{const order=createOrder({...data,items:cart});clearCart();setCart([]);setActiveOrder(order);navigate("order",{order:order.number})}}/>} {screen==="order"&&<OrderPage order={orderId?getOrder(orderId):activeOrder} onMore={()=>navigate("menu")}/>}</main><BottomNavigation screen={screen} cartCount={cartCount} onGo={goMain}/></div>
}
