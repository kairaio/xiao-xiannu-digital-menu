import type {CartLine,MenuItem} from "../../types/menu";
import {BookSpread} from "../../components/book/BookSpread";
export default function MenuPage(props:{cart:CartLine[];onOpen:(item:MenuItem)=>void;onQty:(item:MenuItem,qty:number)=>void}){return <BookSpread {...props}/>}
