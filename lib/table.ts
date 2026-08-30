export function normalizeTable(value:string){return value.trim().replace(/[^A-Za-z0-9-]/g,"").slice(0,12)}
