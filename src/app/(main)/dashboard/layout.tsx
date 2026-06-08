"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { VerificationBanner } from "@/components/ui/verification-banner";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const showVerificationBanner =
    status === "authenticated" && !session?.user?.emailVerified;

  const activePage = pathname.startsWith("/dashboard/projects")
    ? "projects"
    : pathname.startsWith("/dashboard/feedback")
      ? "feedback"
      : pathname.startsWith("/dashboard/settings")
        ? "settings"
        : pathname.startsWith("/dashboard/profile")
          ? "profile"
          : "dashboard";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        page={activePage}
        setPage={(page) =>
          router.push(`/dashboard/${page === "projects" ? "projects" : page}`)
        }
        onLogout={() => signOut({ callbackUrl: "/" })}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showVerificationBanner && <VerificationBanner  />}
        <Header pathname={pathname} />
        <div className="flex-1 overflow-hidden flex flex-col">
          <ErrorBoundary context={pathname}>{children}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
