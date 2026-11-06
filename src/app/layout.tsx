import "./globals.css";
import Link from "next/link";
export const metadata = { title: "Foreclosure Ops", description: "Find foreclosed properties & match to buyers" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3 text-sm">
            <Link href="/" className="font-bold">Foreclosure Ops</Link>
            <Link href="/properties">Properties</Link>
            <Link href="/prospects">Prospects</Link>
            <Link href="/matches">Matches</Link>
            <Link href="/scan">Scan</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}