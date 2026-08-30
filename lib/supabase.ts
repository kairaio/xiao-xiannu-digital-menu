import {createClient,RealtimeChannel,User} from "@supabase/supabase-js";
const env=(import.meta as ImportMeta&{env?:Record<string,string>}).env||{};
const supabaseUrl=env.VITE_SUPABASE_URL||"https://tgmnctkbcwgdkgpccwsw.supabase.co";
const supabaseKey=env.VITE_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_Cy2VOIhTV4aK6I__HvW8Sw_MxU1mTk7";
export const supabase=createClient(supabaseUrl,supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
export type StaffRole="admin"|"driver"|"pending";
export type StaffProfile={id:string;role:StaffRole;display_name:string;email?:string};
export type OnlineOrderRow={id:string;number:string;tracking_token:string;customer:string;phone:string;order_type:"Delivery"|"Pickup"|"Dine-In";address:string;location_url:string;table_number:string;requested_time:string;notes:string;delivery_fee:number;items:unknown[];subtotal:number;total:number;status:string;driver_id:string|null;driver_name:string;created_at:string;updated_at:string};
export type DriverLocation={order_id:string;driver_id:string;latitude:number;longitude:number;accuracy:number|null;heading:number|null;speed:number|null;updated_at:string};
export async function signInStaff(email:string,password:string){const{data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;return data.user}
export async function signOutStaff(){await supabase.auth.signOut()}
export async function getStaffProfile(user?:User|null){const active=user||(await supabase.auth.getUser()).data.user;if(!active)return null;const{data,error}=await supabase.from("profiles").select("id,role,display_name").eq("id",active.id).maybeSingle();if(error)throw error;return data?{...data,email:active.email||""} as StaffProfile:null}
export async function createOnlineOrder(row:OnlineOrderRow){const{error}=await supabase.from("orders").insert(row);if(error)throw error;return row}
function trackingClient(credential:{token?:string;phone?:string}){return createClient(supabaseUrl,supabaseKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{...(credential.token?{"x-tracking-token":credential.token}:{}),...(credential.phone?{"x-tracking-phone":credential.phone.replace(/\D/g,"")}:{})}}})}
async function tracked(number:string,credential:{token?:string;phone?:string}){const client=trackingClient(credential),{data,error}=await client.from("orders").select("*").eq("number",number).maybeSingle();if(error)throw error;if(!data)return null;const location=await client.from("driver_locations").select("*").eq("order_id",data.id).maybeSingle();if(location.error)throw location.error;return{order:data as OnlineOrderRow,driverLocation:location.data as DriverLocation|null}}
export const fetchTrackedOrder=(number:string,token:string)=>tracked(number,{token});
export const findTrackedOrder=(number:string,phone:string)=>tracked(number,{phone});
export async function fetchStaffOrders(role:StaffRole,userId:string){let query=supabase.from("orders").select("*").order("created_at",{ascending:false});if(role==="driver")query=query.eq("driver_id",userId);const{data,error}=await query;if(error)throw error;return(data||[]) as OnlineOrderRow[]}
export async function updateOnlineOrder(id:string,changes:Partial<Pick<OnlineOrderRow,"status"|"driver_id"|"driver_name">>){const{error}=await supabase.from("orders").update(changes).eq("id",id);if(error)throw error}
export async function fetchDrivers(){const{data,error}=await supabase.from("profiles").select("id,display_name").eq("role","driver").order("display_name");if(error)throw error;return(data||[]) as Pick<StaffProfile,"id"|"display_name">[]}
export async function publishDriverLocation(location:Omit<DriverLocation,"updated_at">){const{error}=await supabase.from("driver_locations").upsert({...location,updated_at:new Date().toISOString()},{onConflict:"order_id"});if(error)throw error}
export function subscribeToOrders(callback:(event:"INSERT"|"UPDATE"|"DELETE",row:OnlineOrderRow)=>void){return supabase.channel(`orders-${crypto.randomUUID()}`).on("postgres_changes",{event:"*",schema:"public",table:"orders"},payload=>callback(payload.eventType as "INSERT"|"UPDATE"|"DELETE",(payload.new||payload.old) as OnlineOrderRow)).subscribe()}
export async function removeChannel(channel:RealtimeChannel){await supabase.removeChannel(channel)}
