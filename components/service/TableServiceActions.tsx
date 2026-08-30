import {useState} from "react";
import {BellRing,ReceiptText,Check} from "lucide-react";
import {createServiceRequest,type ServiceRequestType} from "../../store/serviceRequestStore";

export function TableServiceActions({table}:{table:string}){
 const[busy,setBusy]=useState<ServiceRequestType|null>(null);
 const[done,setDone]=useState<ServiceRequestType|null>(null);
 const[error,setError]=useState("");
 const send=async(type:ServiceRequestType)=>{
  if(!table||busy)return;
  setBusy(type);setError("");
  try{
   await createServiceRequest(table,type);
   setDone(type);
   window.setTimeout(()=>setDone(null),2500);
  }catch(e){
   console.error("[Service Request]",e);
   setError("Request could not be sent. Please try again.");
  }finally{setBusy(null)}
 };
 return <section className="table-service-actions" aria-label="Table service">
  <button type="button" disabled={Boolean(busy)} onClick={()=>send("waiter")}>
   {done==="waiter"?<Check/>:<BellRing/>}
   <span><b>{done==="waiter"?"Waiter Called":"Call Waiter"}</b><small>Ask staff to come to Table {table}</small></span>
  </button>
  <button type="button" disabled={Boolean(busy)} onClick={()=>send("bill")}>
   {done==="bill"?<Check/>:<ReceiptText/>}
   <span><b>{done==="bill"?"Bill Requested":"Request Bill"}</b><small>Ask for bill / payment</small></span>
  </button>
  {error&&<p role="alert">{error}</p>}
 </section>;
}
