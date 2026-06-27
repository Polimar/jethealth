import Link from "next/link";
import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B5FA5] text-white">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          JetHealth
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
