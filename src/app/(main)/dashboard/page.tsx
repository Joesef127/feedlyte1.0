import { redirect } from "next/navigation";

// Default dashboard route redirects to projects
export default function DashboardPage() {
  redirect("/dashboard/projects");
}