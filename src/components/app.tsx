"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Page, Project } from "@/types";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProjectsPage } from "@/components/projects/projects-page";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";
import { AllFeedbackPage } from "@/components/feedback/all-feedback-page";
import { SettingsPage } from "@/components/settings/settings-page";
import { VerificationBanner } from "@/components/ui/verification-banner";

export function App() {
  const { data: session, status } = useSession();
  const [page, setPage] = useState<Page>("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth");
  }

  const handleSetPage = (p: Page) => {
    setPage(p);
    setSelectedProject(null);
  };

  // Show banner only when session is loaded and email is not verified
  const showVerificationBanner =
    status === "authenticated" && !session?.user?.emailVerified;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        page={selectedProject ? "projects" : page}
        setPage={handleSetPage}
        onLogout={() => signOut({ redirect: false })}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showVerificationBanner && <VerificationBanner />}
        <Header page={page} project={selectedProject} />
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedProject ? (
            <ProjectDetailPage
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
              onUpdate={setSelectedProject}
            />
          ) : page === "projects" ? (
            <ProjectsPage onSelectProject={setSelectedProject} />
          ) : page === "feedback" ? (
            <AllFeedbackPage />
          ) : (
            <SettingsPage />
          )}
        </div>
      </div>
    </div>
  );
}