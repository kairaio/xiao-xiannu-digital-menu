import type {CartLine} from "../types/menu";
const KEY="xx-orders";
export type StoredOrder={number:string;customer:string;phone:string;type:"Dine-In"|"Pickup";address:string;location:string;table:string;requestedTime:string;notes:string;deliveryFee:number;items:CartLine[];subtotal:number;total:number;status:string;driver:string;createdAt:string};
export function readOrders():StoredOrder[]{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export function getOrder(number:string){return readOrders().find(o=>o.number===number)||null}
export function createOrder(input:{type:"Dine-In"|"Take Away";table:string;packAsTakeAway:boolean;notes:string;items:CartLine[]}){
 const subtotal=input.items.reduce((sum,item)=>sum+item.price*item.qty,0);
 const suffix=String(Date.now()).slice(-3);const table=(input.table||"00").padStart(2,"0");
 const number=input.type==="Dine-In"?`DI-${table}${suffix}`:`TA-${String(Date.now()).slice(-5)}`;
 const extra=[input.packAsTakeAway?"Pack this order as Take Away":"",input.notes].filter(Boolean).join(" · ");
 const order:StoredOrder={number,customer:input.type==="Dine-In"?`Table ${table}`:"Take Away Guest",phone:"",type:input.type==="Dine-In"?"Dine-In":"Pickup",address:"",location:"",table:input.type==="Dine-In"?table:(input.table||""),requestedTime:"",notes:extra,deliveryFee:0,items:input.items,subtotal,total:subtotal,status:"Order Received",driver:"Unassigned",createdAt:new Date().toISOString()};
 const next=[order,...readOrders()];localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event("storage"));return order;
}
export function customerStatus(status:string){if(status==="Ready for Delivery")return "Ready";if(status==="Delivered")return "Served";if(["Driver Assigned","On Delivery","Arriving"].includes(status))return "Ready";return status}
