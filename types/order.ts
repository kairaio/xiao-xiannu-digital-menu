export type OrderType="Dine-In"|"Take Away";
export type CustomerOrderStatus="Order Received"|"Confirmed"|"Preparing"|"Ready"|"Served"|"Rejected";
export type CustomerOrder={number:string;customer:string;phone:string;type:OrderType;table:string;packAsTakeAway:boolean;notes:string;items:any[];subtotal:number;total:number;status:CustomerOrderStatus;createdAt:string};
