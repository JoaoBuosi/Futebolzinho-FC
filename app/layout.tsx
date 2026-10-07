import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Futebolzinho FC — Match Center",description:"Match Center do Futebolzinho FC"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}