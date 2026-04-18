import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Header />
      <div className="flex h-full flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}