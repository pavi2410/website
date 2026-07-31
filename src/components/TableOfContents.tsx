import { useEffect, useRef, useState } from 'react';

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  headings: Heading[];
  collapsible?: boolean;
}

export default function TableOfContents({ headings, collapsible = false }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(!collapsible);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Filter to only show h2 and h3 headings, and strip trailing '#' from text
  const tocHeadings = headings
    .filter(h => h.depth === 2 || h.depth === 3)
    .map(h => ({ ...h, text: h.text.replace(/#$/, '').trim() }));

  // Auto-scroll TOC to keep active heading visible
  useEffect(() => {
    if (activeId) {
      const link = linkRefs.current.get(activeId);
      link?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
              setActiveId(id);
            }
          }
        });
      },
      {
        // Account for fixed header (56px) + mobile TOC bar (~48px)
        rootMargin: '-120px 0px -66%',
        threshold: 0,
      }
    );

    // Observe all headings
    const headingElements = document.querySelectorAll('article h2[id], article h3[id]');
    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      headingElements.forEach((heading) => {
        observer.unobserve(heading);
      });
    };
  }, []);

  if (tocHeadings.length === 0) {
    return null;
  }

  // Get active heading for display in collapsed state
  const activeHeading = tocHeadings.find(h => h.slug === activeId) || tocHeadings[0];
  const currentId = activeId || tocHeadings[0].slug;

  // Collapsible mode (mobile): Fumadocs-style dropdown with overlay
  if (collapsible) {
    return (
      <nav className="text-sm not-prose relative" aria-label="Table of contents">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 cursor-pointer bg-neutral-100 dark:bg-transparent hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
          aria-expanded={isOpen}
        >
          <span className="text-neutral-800 dark:text-neutral-200 truncate">{activeHeading?.text}</span>
          <svg
            className={`w-5 h-5 text-neutral-500 dark:text-neutral-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <ul className="absolute left-0 right-0 top-full bg-neutral-100 dark:bg-neutral-950/95 dark:backdrop-blur border-b border-neutral-200 dark:border-neutral-800 list-none p-0 m-0 px-4 pb-4 pt-2 space-y-1 max-h-64 overflow-y-auto z-50">
            {tocHeadings.map((heading) => (
              <li key={heading.slug} className={`m-0 ${heading.depth === 3 ? 'pl-4' : 'pl-0'}`}>
                <a
                  href={`#${heading.slug}`}
                  onClick={() => {
                    setActiveId(heading.slug);
                    setIsOpen(false);
                  }}
                  className={`block py-1.5 transition-colors no-underline ${activeId === heading.slug
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    );
  }

  // Desktop mode: compact edge rail that expands inward on hover or focus
  return (
    <nav
      className="group/toc text-sm not-prose relative h-full w-8"
      aria-label="Table of contents"
    >
      <ul className="absolute right-0 top-1/2 m-0 flex max-h-[calc(100vh-3rem)] w-8 -translate-y-1/2 list-none flex-col gap-0 overflow-x-hidden overflow-y-auto rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50/95 px-2 py-3 backdrop-blur transition-[width] duration-200 group-hover/toc:w-72 group-focus-within/toc:w-72 dark:border-neutral-700 dark:bg-neutral-900/95">
        <li className="m-0 grid shrink-0 grid-cols-[minmax(0,1fr)_1rem] items-center">
          <span className="overflow-hidden whitespace-nowrap pr-3 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500 opacity-0 transition-opacity duration-150 group-hover/toc:opacity-100 group-focus-within/toc:opacity-100 dark:text-neutral-400">
            On this page
          </span>
          <span aria-hidden="true" />
        </li>
        {tocHeadings.map((heading) => (
          <li key={heading.slug} className="m-0 shrink-0">
            <a
              ref={(el) => {
                if (el) linkRefs.current.set(heading.slug, el);
              }}
              href={`#${heading.slug}`}
              onClick={() => setActiveId(heading.slug)}
              aria-current={currentId === heading.slug ? 'location' : undefined}
              title={heading.text}
              className={`grid grid-cols-[minmax(0,1fr)_1rem] items-center rounded-md py-0.5 no-underline outline-none transition-colors hover:bg-neutral-200/60 focus-visible:bg-neutral-200/80 dark:hover:bg-neutral-800/70 dark:focus-visible:bg-neutral-800 ${
                currentId === heading.slug
                  ? 'text-neutral-950 dark:text-neutral-50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              } focus-visible:text-emerald-600 dark:focus-visible:text-emerald-400`}
            >
              <span
                className={`overflow-hidden whitespace-nowrap pr-3 text-xs opacity-0 transition-opacity duration-150 group-hover/toc:opacity-100 group-focus-within/toc:opacity-100 ${
                  heading.depth === 3 ? 'pl-4' : ''
                }`}
              >
                {heading.text}
              </span>
              <span className="flex h-4 items-center justify-end" aria-hidden="true">
                <span
                  className={`block rounded-full transition-[width,background-color] duration-150 ${
                    currentId === heading.slug
                      ? 'h-[3px] w-4 bg-emerald-500'
                      : heading.depth === 3
                        ? 'h-0.5 w-2 bg-neutral-400 dark:bg-neutral-600'
                        : 'h-0.5 w-3 bg-neutral-400 dark:bg-neutral-600'
                  }`}
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
