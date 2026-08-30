import legacySource from "../app/page.tsx?raw";
import type {MenuItem} from "../types/menu";

const rx=/\{id:\"([^\"]+)\",name:\"([^\"]+)\",description:\"([^\"]+)\",price:([\d.]+),image:\"([^\"]+)\"(?:,unit:\"([^\"]+)\")?\}/g;
const parsed:MenuItem[]=[];
for(const match of legacySource.matchAll(rx)){
 const [,id,name,description,price,image,unit]=match;
 parsed.push({id,name,description,price:Number(price),image,unit:unit||undefined,category:id.startsWith("B")?"Sushi":"Sashimi"});
}
export const menu=parsed;
export const categories=[
 "Sashimi",
 "Sushi",
 "Salad & Appetizers",
 "Teppanyaki & Grill",
 "Skewers",
 "Tempura & Fried",
 "Hotpot & Soup",
 "Noodles & Rice",
 "Set Meals",
];
export const byCategory=(category:string)=>menu.filter(item=>item.category.toLowerCase()===category.toLowerCase());
export const getMenuItem=(id:string)=>menu.find(item=>item.id.toLowerCase()===id.toLowerCase());
