import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import IconX from "~icons/tabler/x";
import IconStar from "~icons/tabler/star";
import IconExternalLink from "~icons/tabler/external-link";
import IconBrandGithub from "~icons/tabler/brand-github";
import { languageColor } from "./languageColors";
import type { Project } from "./types";

type Props = {
  project: Project;
  onClose: () => void;
};

export default function ProjectModal({ project, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const visitUrl = project.homepage ?? project.url;

  return (
    <>
      <motion.button
        type="button"
        aria-label="Close project details"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-neutral-900 bg-white p-6 shadow-2xl sm:p-8 dark:border-neutral-700 dark:bg-neutral-900"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-neutral-100 p-3 dark:bg-neutral-800">
              <motion.img
                layoutId={`project-icon-${project.title}`}
                src={project.icon}
                alt={project.title}
                width={56}
                height={56}
                className="rounded-xl"
              />
            </div>
            <div>
              <motion.h2
                id="project-modal-title"
                layoutId={`project-title-${project.title}`}
                className="font-bricolage text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-white"
              >
                {project.title}
              </motion.h2>
              {(project.stars != null || project.language) && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                  {project.stars != null && (
                    <span className="inline-flex items-center gap-1">
                      <IconStar className="h-4 w-4" />
                      {project.stars.toLocaleString()} stars
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
            </div>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
          {project.longDescription}
        </p>

        {project.topics.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {project.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-neutral-100 px-3 py-1 font-bricolage text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : project.techStack.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-neutral-100 px-3 py-1 font-bricolage text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {tech}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <a
            href={visitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-neutral-900 px-5 py-2.5 font-bricolage text-sm font-bold text-white transition-colors hover:bg-neutral-800 dark:border-neutral-600 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <IconExternalLink className="h-4 w-4" />
            Visit
          </a>
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 px-5 py-2.5 font-bricolage text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800"
            >
              <IconBrandGithub className="h-4 w-4" />
              GitHub
            </a>
          )}
        </div>
        </motion.div>
      </motion.div>
    </>
  );
}
