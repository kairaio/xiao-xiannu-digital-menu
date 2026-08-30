export type MenuItem={id:string;name:string;description:string;price:number;image:string;unit?:string;category:string};
export type CartLine=MenuItem&{qty:number;note:string};
