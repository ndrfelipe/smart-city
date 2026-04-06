import type { Metadata } from "next";
import { Provider } from "@/components/ui/provider";
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: "Gestão Urbana",
  description: "Plataforma Smart City",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Provider>
          <div className="flex h-screen w-full flex-col overflow-hidden">
            <Header />
            <div className="flex h-full flex-1">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
                {children}
              </main>
            </div>
          </div>
        </Provider>
      </body>
    </html>
  );
}