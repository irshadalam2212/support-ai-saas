import { useMatches } from "react-router";

export type RouteHandle = { title: string };

/** The title declared by the deepest matching route. */
export function usePageTitle(): string | undefined {
  const matches = useMatches();
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index].handle as RouteHandle | undefined;
    if (handle?.title) return handle.title;
  }
  return undefined;
}
