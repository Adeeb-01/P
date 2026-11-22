"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import clsx from "clsx";
import { SPRING_SNAPPY, useCachedRect, usePointerEffects } from "@/components/motion/hooks";
import { projectHref, type Project } from "@/lib/projects";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { WebGLImagePlane } from "@/components/fx/WebGLImagePlane";

const MAX_TILT = 4;
const MotionLink = m.create(Link);

/**
 * Project tile with spring 3D tilt and lift. The global CustomCursor turns into a
 * "View Case Study" lens over it (data-cursor="view").
 * Image hover treatments preserved from the original pages:
 *  - "featured" (home): image scales to 1.03 over 560ms.
 *  - "gallery" (works): the overscanned image wrapper eases its inset to 0 over 400ms.
 */
export function ProjectCard({ project, variant }: { project: Project; variant: "featured" | "gallery" }) {
  const featured = variant === "featured";
  const image = featured ? project.featuredImage : project.image;
  const Title = featured ? "h3" : "span";
  const enabled = usePointerEffects();
  const hostRef = useRef<HTMLAnchorElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), SPRING_SNAPPY);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), SPRING_SNAPPY);
  const lift = useSpring(0, SPRING_SNAPPY);
  const { measure, reset } = useCachedRect();

  const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!enabled) return;
    const rect = measure(event.currentTarget);
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
    lift.set(-6);
  };
  const onPointerLeave = () => {
    reset();
    px.set(0);
    py.set(0);
    lift.set(0);
  };

  return (
    <MotionLink
      ref={hostRef}
      id={featured ? `project-${project.slug}` : undefined}
      href={projectHref(project.slug)}
      aria-label={`View ${project.title} case study`}
      data-cursor="view"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={enabled ? { rotateX, rotateY, y: lift, transformPerspective: 1100 } : undefined}
      className={clsx(
        "group relative block aspect-[1.31905] w-full cursor-pointer overflow-hidden rounded-5xl text-white max-xl:rounded-[32px]",
        "transition-shadow duration-500 ease-luzia hover-fine:hover:shadow-[0_30px_60px_-30px_rgba(17,17,17,0.45)]",
        featured ? "scroll-mt-20 bg-surface" : "bg-surface",
      )}
    >
      <span
        className={clsx(
          "absolute -inset-x-[17px] -inset-y-[13px] block",
          !featured && "transition-[inset] duration-[400ms] ease-framer group-focus-visible:inset-0 hover-fine:group-hover:inset-0",
        )}
      >
        <span
          className={clsx(
            "relative block h-full w-full",
            featured &&
              "origin-center transition-transform duration-[560ms] ease-luzia group-focus-visible:[transform:scale(1.03)] group-focus-visible:will-change-transform hover-fine:group-hover:[transform:scale(1.03)] hover-fine:group-hover:will-change-transform motion-reduce:transition-none motion-reduce:group-hover:transform-none! motion-reduce:group-focus-visible:transform-none!",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- overscanned cover image needs exact box sizing */}
          <img
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            className="block h-full w-full object-cover object-center"
          />
          {/* Liquid ripple + chromatic aberration (shared WebGL context, active only while moving). */}
          <WebGLImagePlane src={image.src} hostRef={hostRef} />
        </span>
      </span>

      <span
        className={clsx(
          "absolute inset-x-0 bottom-0 isolate flex flex-col gap-3 px-6 pb-6",
          "before:absolute before:-z-[1] before:backdrop-blur-[20px] before:content-['']",
          "before:[-webkit-mask-image:linear-gradient(180deg,transparent_5%,rgba(0,0,0,0.473)_50%,rgb(0,0,0)_100%)] before:[mask-image:linear-gradient(180deg,transparent_5%,rgba(0,0,0,0.473)_50%,rgb(0,0,0)_100%)]",
          featured
            ? "items-start before:inset-0"
            : "before:inset-x-0 before:-top-[50px] before:bottom-0 before:bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.58))]",
        )}
      >
        <Title className="m-0 block text-card font-medium text-white">
          <ScrambleText text={project.title} />
        </Title>
        <span className="flex flex-wrap items-center gap-3">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={clsx("rounded-xl border border-line px-3 py-1.5 text-body font-normal text-white", featured && "whitespace-nowrap")}
            >
              {tag}
            </span>
          ))}
        </span>
      </span>
    </MotionLink>
  );
}
