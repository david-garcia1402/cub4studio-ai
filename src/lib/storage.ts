import type { StoredProject } from "./types";

const KEY = "cub4-projects";

function readAll(): StoredProject[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as StoredProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProject(project: StoredProject): void {
  const next = [project, ...readAll().filter((item) => item.id !== project.id)].slice(0, 20);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function loadProject(id: string): StoredProject | null {
  return readAll().find((item) => item.id === id) ?? null;
}

export function updateProject(project: StoredProject): void {
  saveProject(project);
}

export function clearProjects(): void {
  window.localStorage.removeItem(KEY);
}
