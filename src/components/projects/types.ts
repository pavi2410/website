export type Project = {
  title: string;
  icon: string;
  description: string;
  longDescription: string;
  homepage: string | null;
  repo: string | null;
  url: string;
  techStack: string[];
  stars: number | null;
  language: string | null;
  topics: string[];
};
