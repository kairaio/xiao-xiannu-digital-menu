import {createClient} from "@supabase/supabase-js";

const supabase=createClient("https://tgmnctkbcwgdkgpccwsw.supabase.co","sb_publishable_Cy2VOIhTV4aK6I__HvW8Sw_MxU1mTk7");
let liveLocation="";
let accuracy=0;
let photoUrl="";

function setControlledValue(el:HTMLInputElement|HTMLTextAreaElement,value:string){
 const proto=el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
 const setter=Object.getOwnPropertyDescriptor(proto,"value")?.set;
 setter?.call(el,value);
 el.dispatchEvent(new Event("input",{bubbles:true}));
 el.dispatchEvent(new Event("change",{bubbles:true}));
}

function fieldByLabel(form:HTMLFormElement,text:string){
 return [...form.querySelectorAll("label")].find(label=>(label.textContent||"").toLowerCase().includes(text.toLowerCase()))||null;
}
function isDelivery(form:HTMLFormElement){return Boolean(fieldByLabel(form,"Delivery Address"));}
function setStatus(panel:HTMLElement,text:string,ok=false){const el=panel.querySelector<HTMLElement>("[data-delivery-status]");if(el){el.textContent=text;el.dataset.ok=ok?"1":"0";}}
function syncNotes(form:HTMLFormElement){
 const noteLabel=fieldByLabel(form,"Customer Notes");
 const notes=noteLabel?.querySelector("textarea") as HTMLTextAreaElement|null;
 if(!notes)return;
 const clean=notes.value.replace(/\n?\[LIVE DELIVERY VERIFY\][\s\S]*?\[\/LIVE DELIVERY VERIFY\]/g,"").trim();
 const verify=`[LIVE DELIVERY VERIFY]\nGPS: ${liveLocation}\nAccuracy: ±${Math.round(accuracy)} m\nBuilding photo: ${photoUrl}\n[/LIVE DELIVERY VERIFY]`;
 setControlledValue(notes,[clean,verify].filter(Boolean).join("\n"));
}

function enhanceCheckout(){
 const form=document.querySelector<HTMLFormElement>("form.checkout");
 if(!form||!isDelivery(form)||form.querySelector("#xx-delivery-verify"))return;
 const addressLabel=fieldByLabel(form,"Delivery Address");
 const address=addressLabel?.querySelector("textarea") as HTMLTextAreaElement|null;
 const mapLabel=fieldByLabel(form,"Google Maps");
 const mapInput=mapLabel?.querySelector("input") as HTMLInputElement|null;
 if(address){address.readOnly=true;address.placeholder="Tap Use My Live Location below";}
 if(mapInput){mapInput.readOnly=true;mapInput.placeholder="Filled automatically from GPS";}
 const panel=document.createElement("section");
 panel.id="xx-delivery-verify";
 panel.className="delivery-verify-panel";
 panel.innerHTML=`<div class="delivery-verify-head"><b>LIVE DELIVERY VERIFICATION</b><span>Required for Delivery</span></div><p>Use your current GPS location and upload a photo of the building / delivery point.</p><button type="button" data-get-location>📍 Use My Live Location</button><div class="delivery-verify-status" data-delivery-status>Location not verified</div><label class="delivery-photo-label">Upload Building / Location Photo<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" data-location-photo></label><div class="delivery-photo-result" data-photo-result>No photo uploaded</div>`;
 const feeLabel=fieldByLabel(form,"Delivery Fee");
 if(feeLabel)feeLabel.insertAdjacentElement("beforebegin",panel);else addressLabel?.insertAdjacentElement("afterend",panel);
 panel.querySelector<HTMLButtonElement>("[data-get-location]")?.addEventListener("click",()=>{
  const btn=panel.querySelector<HTMLButtonElement>("[data-get-location]")!;
  if(!navigator.geolocation){setStatus(panel,"GPS is not supported on this device");return;}
  btn.disabled=true;setStatus(panel,"Getting live GPS location…");
  navigator.geolocation.getCurrentPosition(pos=>{
   const lat=pos.coords.latitude.toFixed(6),lng=pos.coords.longitude.toFixed(6);
   accuracy=pos.coords.accuracy;liveLocation=`${lat}, ${lng}`;
   const maps=`https://www.google.com/maps?q=${lat},${lng}`;
   if(address)setControlledValue(address,`Live GPS: ${lat}, ${lng} · Accuracy ±${Math.round(accuracy)}m`);
   if(mapInput)setControlledValue(mapInput,maps);
   setStatus(panel,`✓ Live location verified · accuracy ±${Math.round(accuracy)}m`,true);btn.textContent="✓ Live Location Captured";btn.disabled=false;
   if(photoUrl)syncNotes(form);
  },err=>{setStatus(panel,`Location permission failed: ${err.message}`);btn.disabled=false;},{enableHighAccuracy:true,maximumAge:0,timeout:15000});
 });
 panel.querySelector<HTMLInputElement>("[data-location-photo]")?.addEventListener("change",async event=>{
  const input=event.currentTarget as HTMLInputElement,file=input.files?.[0];if(!file)return;
  const result=panel.querySelector<HTMLElement>("[data-photo-result]")!;
  if(file.size>5*1024*1024){result.textContent="Photo must be under 5 MB";input.value="";return;}
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)){result.textContent="Use JPG, PNG, or WebP";input.value="";return;}
  result.textContent="Uploading photo…";
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
  const path=`delivery/${Date.now()}-${Math.random().toString(36).slice(2,9)}.${ext}`;
  const {error}=await supabase.storage.from("delivery-location-photos").upload(path,file,{contentType:file.type,cacheControl:"3600",upsert:false});
  if(error){console.error("[Delivery Photo]",error);result.textContent="Upload failed. Please try again.";return;}
  photoUrl=supabase.storage.from("delivery-location-photos").getPublicUrl(path).data.publicUrl;
  result.innerHTML=`✓ Photo uploaded · <a href="${photoUrl}" target="_blank" rel="noreferrer">Preview</a>`;
  if(liveLocation)syncNotes(form);
 });
}

function enhanceAdminPhotos(){
 document.querySelectorAll<HTMLElement>(".order-note").forEach(note=>{
  if(note.querySelector(".xx-building-photo"))return;
  const match=(note.textContent||"").match(/Building photo:\s*(https?:\/\/\S+)/i);if(!match)return;
  const a=document.createElement("a");a.className="xx-building-photo";a.href=match[1];a.target="_blank";a.rel="noreferrer";a.textContent="📷 View Building / Location Photo";note.appendChild(a);
 });
}

export function installDeliveryVerification(){
 const observer=new MutationObserver(()=>{enhanceCheckout();enhanceAdminPhotos();});
 observer.observe(document.body,{childList:true,subtree:true});
 window.setTimeout(()=>{enhanceCheckout();enhanceAdminPhotos();},0);
 document.addEventListener("submit",event=>{
  const form=event.target as HTMLFormElement;if(!form.matches?.("form.checkout")||!isDelivery(form))return;
  const panel=form.querySelector<HTMLElement>("#xx-delivery-verify");
  if(!liveLocation||!photoUrl){event.preventDefault();event.stopImmediatePropagation();setStatus(panel!,!liveLocation?"Live GPS location is required before ordering":"Building / location photo is required before ordering");panel?.scrollIntoView({behavior:"smooth",block:"center"});return;}
  syncNotes(form);
 },true);
}
