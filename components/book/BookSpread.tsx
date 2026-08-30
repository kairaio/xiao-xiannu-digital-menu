import {useMemo,useState} from "react";
import {Search} from "lucide-react";
import type {CartLine,MenuItem} from "../../types/menu";
import {categories,menu} from "../../data/menu";
import {formatCurrency} from "../../lib/currency";

export function BookSpread({cart,onOpen,onQty}:{cart:CartLine[];onOpen:(item:MenuItem)=>void;onQty:(item:MenuItem,qty:number)=>void}){
 const[category,setCategory]=useState("Sashimi"),[query,setQuery]=useState("");
 const items=useMemo(()=>menu.filter(i=>(category==="All"||i.category===category)&&(!query||`${i.id} ${i.name} ${i.description}`.toLowerCase().includes(query.toLowerCase()))),[category,query]);
 return <section className="menu-book-screen long-menu-screen">
  <div className="book-toolbar">
   <div><p>DIGITAL MENU</p><h1>{category==="All"?"All Menu":category}</h1></div>
   <label className="menu-search"><Search/><input placeholder="Search menu..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
  </div>
  <div className="category-pills sticky-categories">
   <button className={category==="All"?"active":""} onClick={()=>setCategory("All")}>All</button>
   {categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}
  </div>
  <div className="long-menu-grid">
   {items.map(item=>{const qty=cart.find(x=>x.id===item.id)?.qty||0;return <article className="long-menu-card" key={item.id} onClick={()=>onOpen(item)}>
    <div className="long-menu-image"><img src={`${item.image}?v=20260830-long`} alt={item.name}/><span>{item.id}</span></div>
    <div className="long-menu-copy">
     <div><h2>{item.name}</h2><p>{item.description}</p></div>
     <strong>{formatCurrency(item.price)} <small>{item.unit||""}</small></strong>
     <div className="book-qty" onClick={e=>e.stopPropagation()}>{qty>0?<><button onClick={()=>onQty(item,Math.max(0,qty-1))}>−</button><b>{qty}</b><button onClick={()=>onQty(item,qty+1)}>+</button></>:<button className="add-mini" onClick={()=>onQty(item,1)}>ADD</button>}</div>
    </div>
   </article>})}
  </div>
 </section>
}
