import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/types";
import * as projectsAPI from "@/services/api/projects";

const PROJECTS_KEY = ["projects"] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({ queryKey: PROJECTS_KEY, queryFn: projectsAPI.fetchProjects });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsAPI.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Project, "name" | "color" | "position" | "label">> }) =>
      projectsAPI.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsAPI.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}
