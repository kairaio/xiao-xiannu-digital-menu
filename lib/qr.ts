export function qrTableUrl(base:string,table:string){const url=new URL(base);url.searchParams.set("table",table);return url.toString()}
