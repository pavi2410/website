import { useEffect, useState } from 'react';

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

  // Filter to only show h2 and h3 headings
  const tocHeadings = headings.filter(h => h.depth === 2 || h.depth === 3);

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
        rootMargin: '-100px 0px -66%',
        threshold: 1.0,
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

  return (
    <nav className="text-sm mt-6 not-prose" aria-label="Table of contents">
      {collapsible ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 uppercase text-sm font-semibold opacity-50 hover:opacity-70 transition-opacity cursor-pointer"
          aria-expanded={isOpen}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          On this page
        </button>
      ) : (
        <div className="uppercase text-sm font-semibold opacity-50">On this page</div>
      )}
      {isOpen && (
        <ul className="list-none p-0 m-0 space-y-2">
          {tocHeadings.map((heading) => (
            <li key={heading.slug} className={`m-0 ${heading.depth === 3 ? 'pl-4' : 'pl-0'}`}>
              <a
                href={`#${heading.slug}`}
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
      )}
    </nav>
  );
}
