import type { StoredProject } from "./types";

const KEY = "cub4-projects";
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function parseAll(raw: string | null): StoredProject[] {
  try {
    const parsed = JSON.parse(raw ?? "[]") as StoredProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readAll(): StoredProject[] {
  if (typeof window === "undefined") return [];
  return parseAll(window.localStorage.getItem(KEY));
}

/** Raw snapshot for `useSyncExternalStore`: a string is referentially stable across reads. */
export function readProjectsSnapshot(): string {
  return window.localStorage.getItem(KEY) ?? "[]";
}

export function subscribeProjects(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function findProject(snapshot: string, id: string): StoredProject | null {
  return parseAll(snapshot).find((item) => item.id === id) ?? null;
}

export function saveProject(project: StoredProject): void {
  const next = [project, ...readAll().filter((item) => item.id !== project.id)].slice(0, 20);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  notify();
}

export function updateProject(project: StoredProject): void {
  saveProject(project);
}

export function clearProjects(): void {
  window.localStorage.removeItem(KEY);
  notify();
}
