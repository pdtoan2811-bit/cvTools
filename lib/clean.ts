import type { CvData } from "./types";

const lines = (arr?: string[]) => (arr || []).map((s) => s.trim()).filter(Boolean);

/**
 * Drop the blank lines the editor keeps around while you type, so what gets
 * saved and rendered is tidy.
 */
export function cleanCv(d: CvData): CvData {
  return {
    ...d,
    name: d.name.trim(),
    summary: lines(d.summary),
    experience: (d.experience || []).map((e) => ({
      ...e,
      points: lines(e.points),
      achievements: (e.achievements || [])
        .map((g) => ({ ...g, points: lines(g.points) }))
        .filter((g) => g.points.length > 0),
      products: (e.products || []).filter((p) => p.name.trim()),
    })),
    education: (d.education || []).map((e) => ({
      ...e,
      certifications: lines(e.certifications),
    })),
    skills: lines(d.skills),
    clients: (d.clients || []).filter((c) => c.name.trim()),
    languages: (d.languages || []).filter((l) => l.name.trim()),
    links: (d.links || []).filter((l) => l.url.trim()),
    projects: (d.projects || []).filter((p) => p.name.trim()),
  };
}
