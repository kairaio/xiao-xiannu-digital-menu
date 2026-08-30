import type {CartLine,MenuItem} from "../../../types/menu";
import {ItemDetail} from "../../../components/item/ItemDetail";
export default function ItemPage(props:{item:MenuItem;line?:CartLine;onBack:()=>void;onQty:(qty:number)=>void;onNote:(note:string)=>void;onAdd:()=>void}){return <ItemDetail {...props}/>}
