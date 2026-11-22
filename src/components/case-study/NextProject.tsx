"use client";

import Link from "next/link";
import { useRef } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { projectHref, type Project } from "@/lib/projects";

/** "Next project" teaser: the cover parallaxes inside a clip as the visitor approaches the end of the page. */
export function NextProject({ project }: { project: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.18, 1.04]);

  return (
    <Link
      ref={ref}
      href={projectHref(project.slug)}
      data-cursor="view"
      aria-label={`Next project: ${project.title}`}
      className="group relative block aspect-[16/8] overflow-hidden rounded-5xl bg-ink text-white max-md:aspect-[4/5] max-md:rounded-[32px]"
    >
      <m.img
        src={project.image.src}
        alt=""
        width={project.image.width}
        height={project.image.height}
        style={{ y, scale }}
        className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-85"
      />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.1),rgba(17,17,17,0.75))]" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-10 max-md:flex-col max-md:items-start max-md:p-6">
        <span className="flex flex-col gap-3">
          <span className="text-small text-white/70">Next project</span>
          <span className="text-[88px] leading-[0.95] font-medium tracking-[-0.05em] max-xl:text-[64px] max-md:text-[44px]">{project.title}</span>
        </span>
        <span className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-xl border border-white/40 px-3 py-1.5 text-body">
              {tag}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
