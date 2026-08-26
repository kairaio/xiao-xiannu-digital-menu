import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"小仙女 Japanese Restaurant — Digital Menu + Delivery Pro",description:"Browse authentic Japanese set meals, order online, and follow your delivery with Xiao Xiannu Japanese Cuisine."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
