import type { Metadata } from "next";
import { ProjectsPage } from "@/components/projects/projects-page";

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage feedback projects, widget configuration, and embed codes.",
};

export default function ProjectsRoute() {
  return <ProjectsPage />;
}