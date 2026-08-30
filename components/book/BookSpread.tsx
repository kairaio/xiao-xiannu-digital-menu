import {useMemo,useState} from "react";
import {Search} from "lucide-react";
import type {CartLine,MenuItem} from "../../types/menu";
import {categories,menu} from "../../data/menu";
import {formatCurrency} from "../../lib/currency";

export function BookSpread({cart,onOpen,onQty}:{cart:CartLine[];onOpen:(item:MenuItem)=>void;onQty:(item:MenuItem,qty:number)=>void}){
 const[category,setCategory]=useState("Sashimi"),[query,setQuery]=useState("");
 const items=useMemo(()=>menu.filter(i=>(category==="All"||i.category===category)&&(!query||`${i.id} ${i.name} ${i.description}`.toLowerCase().includes(query.toLowerCase()))),[category,query]);
 return <section className="menu-book-screen"><div className="book-toolbar"><div><p>DIGITAL MENU BOOK</p><h1>Choose your dish</h1></div><label className="menu-search"><Search/><input placeholder="Search menu..." value={query} onChange={e=>setQuery(e.target.value)}/></label></div><div className="category-pills"><button className={category==="All"?"active":""} onClick={()=>setCategory("All")}>All</button>{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="book-shell"><div className="book-pages category-long-list">{items.map(item=>{const qty=cart.find(x=>x.id===item.id)?.qty||0;return <article className="book-page category-long-card" key={item.id} onClick={()=>onOpen(item)}><div className="book-image"><img src={`${item.image}?v=20260830-book`} alt={item.name}/><span>{item.id}</span></div><div className="book-copy"><h2>{item.name}</h2><p>{item.description}</p><strong>{formatCurrency(item.price)} <small>{item.unit||""}</small></strong><div className="book-qty" onClick={e=>e.stopPropagation()}>{qty>0?<><button onClick={()=>onQty(item,Math.max(0,qty-1))}>−</button><b>{qty}</b><button onClick={()=>onQty(item,qty+1)}>+</button></>:<button className="add-mini" onClick={()=>onQty(item,1)}>ADD</button>}</div></div></article>})}</div></div></section>
}
