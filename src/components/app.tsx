"use client";

import { useState } from "react";
import type { Feedback, Page, Project } from "@/types";
import { MOCK_PROJECTS, INITIAL_FEEDBACK } from "@/data/mock";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProjectsPage } from "@/components/projects/projects-page";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";
import { AllFeedbackPage } from "@/components/feedback/all-feedback-page";
import { SettingsPage } from "@/components/settings/settings-page";

export function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState<Page>("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [feedback, setFeedback] = useState<Feedback[]>(INITIAL_FEEDBACK);

  if (!authed) {
    return <AuthScreen onLogin={() => setAuthed(true)} />;
  }

  const handleSetPage = (p: Page) => {
    setPage(p);
    setSelectedProject(null);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        page={selectedProject ? "projects" : page}
        setPage={handleSetPage}
        onLogout={() => setAuthed(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header page={page} project={selectedProject} />
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedProject ? (
            <ProjectDetailPage
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
              feedback={feedback}
              setFeedback={setFeedback}
            />
          ) : page === "projects" ? (
            <ProjectsPage
              projects={projects}
              setProjects={setProjects}
              onSelectProject={setSelectedProject}
            />
          ) : page === "feedback" ? (
            <AllFeedbackPage
              feedback={feedback}
              setFeedback={setFeedback}
              projects={projects}
            />
          ) : (
            <SettingsPage />
          )}
        </div>
      </div>
    </div>
  );
}
