import {createClient} from "@supabase/supabase-js";

const SUPABASE_URL="https://tgmnctkbcwgdkgpccwsw.supabase.co";
const SUPABASE_KEY="sb_publishable_Cy2VOIhTV4aK6I__HvW8Sw_MxU1mTk7";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);

export type ServiceRequestType="waiter"|"bill";
export type ServiceRequestStatus="pending"|"acknowledged"|"completed";
export type ServiceRequest={
 id:string;
 table_number:string;
 request_type:ServiceRequestType;
 status:ServiceRequestStatus;
 created_at:string;
 updated_at:string;
};

export async function createServiceRequest(table:string,requestType:ServiceRequestType){
 const normalized=table.trim();
 if(!normalized)throw new Error("Table number is required");
 const {data:existing}=await supabase.from("service_requests")
  .select("*")
  .eq("table_number",normalized)
  .eq("request_type",requestType)
  .in("status",["pending","acknowledged"])
  .order("created_at",{ascending:false})
  .limit(1)
  .maybeSingle();
 if(existing)return existing as ServiceRequest;
 const {data,error}=await supabase.from("service_requests")
  .insert({table_number:normalized,request_type:requestType,status:"pending"})
  .select("*")
  .single();
 if(error)throw error;
 return data as ServiceRequest;
}

export async function listOpenServiceRequests(){
 const {data,error}=await supabase.from("service_requests")
  .select("*")
  .neq("status","completed")
  .order("created_at",{ascending:true});
 if(error)throw error;
 return (data||[]) as ServiceRequest[];
}

export async function updateServiceRequest(id:string,status:ServiceRequestStatus){
 const {error}=await supabase.from("service_requests")
  .update({status,updated_at:new Date().toISOString()})
  .eq("id",id);
 if(error)throw error;
}

export function subscribeServiceRequests(onChange:()=>void){
 const channel=supabase.channel(`service-requests-${Math.random().toString(36).slice(2)}`)
  .on("postgres_changes",{event:"*",schema:"public",table:"service_requests"},onChange)
  .subscribe();
 return()=>{void supabase.removeChannel(channel)};
}
