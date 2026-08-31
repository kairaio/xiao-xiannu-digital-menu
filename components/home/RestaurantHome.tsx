import {Clock3,MapPin,ShoppingBag,Utensils,LayoutDashboard,QrCode,MessageCircle} from "lucide-react";

export default function RestaurantHome(){
 const open=(view:string)=>{location.href=`${location.pathname}?view=${view}`};
 const openTable=()=>{location.href=`${location.pathname}?table=08&theme=black`};
 return <div className="xx-home">
  <div className="xx-demo-strip"><span>KH DIGITAL · RESTAURANT SYSTEM DEMO</span><b>Interactive Demo</b></div>
  <header className="xx-home-topbar">
   <a className="xx-home-brand" href={location.pathname}>
    <span className="xx-home-mark">小仙女</span>
    <span><b>Japanese Restaurant</b><small>日本料理 · Japanese Cuisine</small></span>
   </a>
   <nav>
    <a href="#about">About</a>
    <a href="#experience">Experience</a>
    <button type="button" onClick={()=>open("track")}>Track Order</button>
    <button className="primary" type="button" onClick={()=>open("menu")}>View Menu</button>
   </nav>
  </header>

  <main>
   <section className="xx-home-hero">
    <div className="xx-home-hero-media">
     <img src="./assets/images/menu/A01.png" alt="Premium Japanese restaurant dining"/>
     <div className="xx-home-hero-shade"/>
    </div>
    <div className="xx-home-hero-copy">
     <p className="xx-home-kicker">小仙女日式料理 · JAPANESE RESTAURANT</p>
     <h1>A refined Japanese<br/><em>dining experience.</em></h1>
     <p className="xx-home-lead">Explore a complete digital restaurant experience with online ordering, table QR, delivery tracking and restaurant operations.</p>
     <div className="xx-home-actions">
      <button type="button" onClick={()=>open("menu")}><Utensils size={18}/> Explore Menu</button>
      <button className="ghost" type="button" onClick={openTable}><QrCode size={18}/> Try Table QR</button>
     </div>
     <div className="xx-home-meta"><span><Clock3/> Open 24 Hours</span><span><ShoppingBag/> Dine-In · Pickup · Delivery</span></div>
    </div>
   </section>

   <section id="about" className="xx-home-intro">
    <div><p className="xx-home-kicker dark">RESTAURANT DIGITAL EXPERIENCE</p><h2>One system for the<br/>entire ordering journey.</h2></div>
    <div><p>This showcase demonstrates how a restaurant can let customers browse the menu, order from their table, choose pickup or delivery, track order status and manage operations from an admin dashboard.</p><button type="button" onClick={()=>open("menu")}>Open Digital Menu →</button></div>
   </section>

   <section id="experience" className="xx-home-features">
    <article><span>01</span><h3>Dine-In</h3><p>Scan the unique table QR, browse the menu and place an order directly from a phone.</p></article>
    <article><span>02</span><h3>Pickup</h3><p>Choose dishes online and prepare the order for restaurant pickup.</p></article>
    <article><span>03</span><h3>Delivery</h3><p>Order online, share the delivery location and follow order status from the customer device.</p></article>
   </section>

   <section className="xx-demo-showcase">
    <div className="xx-demo-copy"><p className="xx-home-kicker">TRY THE COMPLETE DEMO</p><h2>See both sides of the system.</h2><p>Test the customer experience, scan-style table ordering and the restaurant admin dashboard from the same demo.</p></div>
    <div className="xx-demo-cards">
     <button onClick={()=>open("menu")}><Utensils/><span><b>Customer Menu</b><small>Browse, cart & checkout</small></span></button>
     <button onClick={openTable}><QrCode/><span><b>Table 08 QR</b><small>Direct dine-in ordering</small></span></button>
     <button onClick={()=>open("admin")}><LayoutDashboard/><span><b>Admin Dashboard</b><small>Orders & operations</small></span></button>
    </div>
   </section>

   <section className="xx-home-cta">
    <p className="xx-home-kicker">WANT A SYSTEM LIKE THIS?</p><h2>Build your restaurant<br/>digital experience.</h2><p className="xx-home-cta-copy">Menu, table QR ordering, dashboard, delivery and tracking can be customized for your restaurant.</p><div className="xx-contact-actions"><a href="https://t.me/Khdigital2026" target="_blank" rel="noreferrer"><MessageCircle/>Telegram</a><a href="https://wa.me/855964065246" target="_blank" rel="noreferrer"><MessageCircle/>WhatsApp</a></div>
   </section>
  </main>

  <footer className="xx-home-footer"><b>KH DIGITAL · Restaurant System Demo</b><span>Digital Solutions for Restaurants</span></footer>
 </div>;
}
