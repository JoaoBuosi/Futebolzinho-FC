import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Futebolzinho FC — Seu universo, suas regras", description: "Crie sua carreira, escolha seu clube e construa uma história no futebol." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body>{children}</body></html>; }
