import {Clock3,MapPin,ShoppingBag,Utensils} from "lucide-react";

export default function RestaurantHome(){
 const open=(view:string)=>{location.href=`${location.pathname}?view=${view}`};
 return <div className="xx-home">
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
     <img src="./assets/images/menu/A01.png" alt="Xiao Xiannu Japanese Restaurant signature sashimi"/>
     <div className="xx-home-hero-shade"/>
    </div>
    <div className="xx-home-hero-copy">
     <p className="xx-home-kicker">小仙女日式料理 · JAPANESE RESTAURANT</p>
     <h1>A refined Japanese<br/><em>dining experience.</em></h1>
     <p className="xx-home-lead">Discover premium Japanese cuisine, carefully prepared and ready to order for dine-in, pickup or delivery.</p>
     <div className="xx-home-actions">
      <button type="button" onClick={()=>open("menu")}><Utensils size={18}/> Explore Menu</button>
      <button className="ghost" type="button" onClick={()=>open("track")}><MapPin size={18}/> Track Order</button>
     </div>
     <div className="xx-home-meta"><span><Clock3/> Open 24 Hours</span><span><ShoppingBag/> Dine-In · Pickup · Delivery</span></div>
    </div>
   </section>

   <section id="about" className="xx-home-intro">
    <div><p className="xx-home-kicker dark">WELCOME TO 小仙女</p><h2>Japanese cuisine,<br/>made for every occasion.</h2></div>
    <div><p>Browse our digital menu when you are ready to order. Customers dining at the restaurant can also scan the QR code at their table for a faster ordering experience.</p><button type="button" onClick={()=>open("menu")}>Open Digital Menu →</button></div>
   </section>

   <section id="experience" className="xx-home-features">
    <article><span>01</span><h3>Dine-In</h3><p>Scan the table QR, browse the menu and place an order directly from your phone.</p></article>
    <article><span>02</span><h3>Pickup</h3><p>Choose your dishes online and prepare your order for restaurant pickup.</p></article>
    <article><span>03</span><h3>Delivery</h3><p>Order online, share your location and follow the delivery status from your device.</p></article>
   </section>

   <section className="xx-home-cta">
    <p className="xx-home-kicker">READY TO ORDER?</p><h2>Explore the menu.</h2><button type="button" onClick={()=>open("menu")}>View Menu</button>
   </section>
  </main>

  <footer className="xx-home-footer"><b>小仙女 Japanese Restaurant</b><span>Digital Restaurant Experience</span></footer>
 </div>;
}
