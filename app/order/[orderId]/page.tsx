import type {StoredOrder} from "../../../store/orderStore";
import {OrderStatusView} from "../../../components/order/OrderStatus";
export default function OrderPage(props:{order:StoredOrder|null;onMore:()=>void}){return <OrderStatusView {...props}/>}
