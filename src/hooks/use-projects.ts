import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectsAPI from "@/services/api/projects";

const PROJECTS_KEY = ["projects"] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({ queryKey: PROJECTS_KEY, queryFn: projectsAPI.fetchProjects });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id] as const,
    queryFn: () => projectsAPI.fetchProject(id),
    enabled: Boolean(id),
  });
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
    mutationFn: ({ id, data }: { id: string; data: projectsAPI.ProjectPayload }) =>
      projectsAPI.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsAPI.deleteProject,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
    },
  });
}
