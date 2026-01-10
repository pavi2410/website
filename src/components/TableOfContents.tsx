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

  // Filter to only show h2 and h3 headings
  const tocHeadings = headings.filter(h => h.depth === 2 || h.depth === 3);

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
                  className={`block py-1.5 transition-colors no-underline ${
                    activeId === heading.slug
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

  // Desktop mode: sidebar with full height and auto-scroll
  return (
    <nav className="text-sm not-prose h-full flex flex-col" aria-label="Table of contents">
      <div className="uppercase text-sm font-semibold opacity-50 shrink-0">On this page</div>
      <ul className="list-none p-0 m-0 space-y-2 flex-1 overflow-y-auto mt-4">
        {tocHeadings.map((heading) => (
          <li key={heading.slug} className={`m-0 ${heading.depth === 3 ? 'pl-4' : 'pl-0'}`}>
            <a
              ref={(el) => {
                if (el) linkRefs.current.set(heading.slug, el);
              }}
              href={`#${heading.slug}`}
              onClick={() => setActiveId(heading.slug)}
              className={`block py-1 transition-colors no-underline border-l-2 pl-3 ${
                activeId === heading.slug
                  ? 'text-neutral-900 dark:text-neutral-100 border-l-emerald-500'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border-transparent'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
