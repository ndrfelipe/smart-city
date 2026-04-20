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
          {/* Container Pai: Ocupa a tela inteira sem scroll externo */}
          <div className="flex h-screen w-full flex-col overflow-hidden">
            <Header />
            
            {/* Wrapper do Corpo: 
                No mobile: empilha (col)
                No desktop: lado a lado (row)
            */}
            <div className="flex flex-1 flex-col md:flex-row min-h-0 overflow-hidden">
              <Sidebar />
              
              {/* O main: 
                  flex-1: pega todo o espaço
                  min-w-0: evita que ele 'suma' no desktop (bug comum de flex)
              */}
              <main className="flex-1 min-w-0 overflow-y-auto bg-gray-100 p-6">
                {children}
              </main>
            </div>
          </div>
        </Provider>
      </body>
    </html>
  );
}