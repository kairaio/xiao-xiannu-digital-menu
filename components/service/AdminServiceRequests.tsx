import {useEffect,useState} from "react";
import {BellRing,ReceiptText,CheckCircle2} from "lucide-react";
import {listOpenServiceRequests,subscribeServiceRequests,updateServiceRequest,type ServiceRequest} from "../../store/serviceRequestStore";

export function AdminServiceRequests(){
 const[requests,setRequests]=useState<ServiceRequest[]>([]);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const load=async()=>{
  try{setRequests(await listOpenServiceRequests());setError("")}
  catch(e){console.error("[Service Requests]",e);setError("Could not load table requests.")}
  finally{setLoading(false)}
 };
 useEffect(()=>{void load();const stop=subscribeServiceRequests(()=>void load());const timer=window.setInterval(()=>void load(),5000);return()=>{stop();window.clearInterval(timer)}},[]);
 const setStatus=async(id:string,status:"acknowledged"|"completed")=>{await updateServiceRequest(id,status);await load()};
 return <section className="admin-service-panel">
  <div className="admin-service-head"><div><p>TABLE SERVICE</p><h2>Waiter & Bill Requests</h2></div><strong>{requests.length} OPEN</strong></div>
  {loading?<p className="admin-service-empty">Loading requests…</p>:error?<p className="admin-service-error">{error}</p>:!requests.length?<p className="admin-service-empty">No table service requests.</p>:<div className="admin-service-list">{requests.map(r=><article key={r.id} className={`admin-service-card ${r.request_type}`}>
   <div className="admin-service-icon">{r.request_type==="waiter"?<BellRing/>:<ReceiptText/>}</div>
   <div className="admin-service-copy"><small>TABLE {r.table_number}</small><h3>{r.request_type==="waiter"?"Call Waiter":"Request Bill / Payment"}</h3><span>{new Date(r.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})} · {r.status==="pending"?"Waiting": "Acknowledged"}</span></div>
   <div className="admin-service-actions">{r.status==="pending"&&<button onClick={()=>setStatus(r.id,"acknowledged")}>Acknowledge</button>}<button className="complete" onClick={()=>setStatus(r.id,"completed")}><CheckCircle2/>Done</button></div>
  </article>)}</div>}
 </section>;
}
