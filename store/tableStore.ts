const KEY="xx-table";
export function detectTable(){const q=new URLSearchParams(location.search);const scanned=(q.get("table")||"").trim();if(/^[A-Za-z0-9-]{1,12}$/.test(scanned)){sessionStorage.setItem(KEY,scanned);return scanned}return sessionStorage.getItem(KEY)||""}
export function saveTable(table:string){if(table)sessionStorage.setItem(KEY,table);else sessionStorage.removeItem(KEY)}
