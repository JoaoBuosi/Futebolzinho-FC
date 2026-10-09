import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Court Dynasty — Construa sua dinastia", description: "Crie sua carreira, escolha seu clube e construa uma história no futebol." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body>{children}</body></html>; }
