import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnauthorizedCardProps {
  permission?: string;
  message?: string;
}

export function UnauthorizedCard({
  permission,
  message = "You do not have permission to view or manage this section.",
}: UnauthorizedCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in-50 duration-300">
      <div className="max-w-md w-full p-8 rounded-xl border border-border bg-card shadow-sm space-y-5">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            403 - Access Denied
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          {permission && (
            <p className="text-xs font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground border border-border inline-block">
              Required: {permission}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
