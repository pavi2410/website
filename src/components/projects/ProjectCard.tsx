import { motion } from "motion/react";
import IconPlus from "~icons/tabler/plus";
import IconStar from "~icons/tabler/star";
import { languageColor } from "./languageColors";
import type { Project } from "./types";

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];

type Props = {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
};

export default function ProjectCard({ project, index, onSelect }: Props) {
  const rotation = ROTATIONS[index % ROTATIONS.length];

  return (
    <button
      type="button"
      onClick={() => onSelect(project)}
      aria-haspopup="dialog"
      className={`group relative block h-full w-full cursor-pointer text-left ${rotation} transition-all duration-300 hover:rotate-0`}
    >
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-neutral-900 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3 dark:bg-neutral-800" />

      <div className="relative flex h-full flex-col rounded-3xl border-2 border-neutral-900 bg-white p-6 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-neutral-100 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-neutral-800">
            <motion.img
              layoutId={`project-icon-${project.title}`}
              src={project.icon}
              alt={project.title}
              width={48}
              height={48}
              className="rounded-xl"
            />
          </div>
          <div className="text-neutral-400 transition-all duration-300 group-hover:rotate-90 group-hover:text-neutral-900 dark:group-hover:text-white">
            <IconPlus className="h-6 w-6" />
          </div>
        </div>

        <motion.h3
          layoutId={`project-title-${project.title}`}
          className="mb-3 font-bricolage text-2xl font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
        >
          {project.title}
        </motion.h3>

        <p className="grow leading-relaxed text-neutral-600 dark:text-neutral-400">
          {project.description}
        </p>

        {(project.stars != null || project.language) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            {project.stars != null && (
              <span className="inline-flex items-center gap-1">
                <IconStar className="h-4 w-4" />
                {project.stars.toLocaleString()}
              </span>
            )}
            {project.language && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: languageColor(project.language) }}
                />
                {project.language}
              </span>
            )}
          </div>
        )}

        {project.techStack.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 border-t-2 border-dashed border-neutral-200 pt-6 dark:border-neutral-800">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-neutral-100 px-3 py-1 font-bricolage text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
