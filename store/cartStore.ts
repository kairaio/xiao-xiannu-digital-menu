import type {CartLine,MenuItem} from "../types/menu";
const KEY="xx-table-cart";
export function readCart():CartLine[]{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export function writeCart(cart:CartLine[]){localStorage.setItem(KEY,JSON.stringify(cart));window.dispatchEvent(new CustomEvent("xx-cart-change"))}
export function setItemQuantity(item:MenuItem,qty:number){const cart=readCart();const next=qty<=0?cart.filter(x=>x.id!==item.id):cart.some(x=>x.id===item.id)?cart.map(x=>x.id===item.id?{...x,qty}:x):[...cart,{...item,qty,note:""}];writeCart(next);return next}
export function setItemNote(id:string,note:string){const next=readCart().map(x=>x.id===id?{...x,note}:x);writeCart(next);return next}
export function clearCart(){writeCart([])}
