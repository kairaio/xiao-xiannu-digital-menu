import type {CartLine} from "../../types/menu";
import {CartView} from "../../components/cart/CartView";
export default function CartPage(props:{table:string;cart:CartLine[];onBack:()=>void;onQty:(line:CartLine,qty:number)=>void;onNote:(id:string,note:string)=>void;onContinue:()=>void}){return <CartView {...props}/>}
