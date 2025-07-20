import { PublicNav } from "@/components/biolink-dashboard/PublicNav";
import { PublicFooter } from "@/components/biolink-dashboard/PublicFooter";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNav />
      <main className="flex-1 flex flex-col items-center justify-center">{children}</main>
      <PublicFooter />
    </div>
  );
} 