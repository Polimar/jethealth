import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MailCheck } from "lucide-react";

export default function VerifyPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#0B5FA5]">
          <MailCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Verifica email</CardTitle>
        <CardDescription>
          Se hai cliccato il link dalla tua email, il tuo account è verificato.
          Ora puoi accedere.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href="/auth/login"
          className={cn(buttonVariants(), "w-full bg-[#0B5FA5] hover:bg-[#094d87]")}
        >
          Vai al login
        </Link>
      </CardContent>
    </Card>
  );
}
