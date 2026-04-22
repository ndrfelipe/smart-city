import { Provider } from "@/components/ui/provider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    </Provider>
  );
}