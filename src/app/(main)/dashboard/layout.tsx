"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { VerificationBanner } from "@/components/ui/verification-banner";

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

  if (status === "unauthenticated") {
    return null;
  }

  const showVerificationBanner =
    status === "authenticated" && !session?.user?.emailVerified;

  const activePage = pathname.startsWith("/dashboard/feedback")
    ? "feedback"
    : pathname.startsWith("/dashboard/settings")
      ? "settings"
      : pathname.startsWith("/dashboard/profile")
        ? "profile"
        : "projects";

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden">
      <div className="flex h-full">
        <Sidebar
          page={activePage}
          setPage={(page) =>
            router.push(`/dashboard/${page === "projects" ? "" : page}`)
          }
          onLogout={() =>
            signOut({
              callbackUrl: "/",
            })
          }
        />

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden pt-16 md:pt-0">
          {showVerificationBanner && <VerificationBanner />}

          <Header pathname={pathname} />

          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
