import type { Project } from "@/types";
import type { ProjectFilters } from "./project-filter-bar";

export function applyProjectFilters(
  projects: Project[],
  filters: ProjectFilters,
) {
  let result = [...projects];

  if (filters.search) {
    const q = filters.search.toLowerCase();

    result = result.filter((p) =>
      p.name.toLowerCase().includes(q),
    );
  }

  if (filters.position) {
    result = result.filter(
      (p) => p.position === filters.position,
    );
  }

  switch (filters.sortBy) {
    case "oldest":
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime(),
      );
      break;

    case "name-asc":
      result.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      break;

    case "name-desc":
      result.sort((a, b) =>
        b.name.localeCompare(a.name),
      );
      break;

    case "feedback-desc":
      result.sort(
        (a, b) => (b.feedbackCount ?? 0) - (a.feedbackCount ?? 0),
      );
      break;

    case "feedback-asc":
      result.sort(
        (a, b) => (a.feedbackCount ?? 0) - (b.feedbackCount ?? 0),
      );
      break;
    default:
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }

  return result;
}