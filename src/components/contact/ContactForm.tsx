"use client";

import { useActionState, useEffect } from "react";
import { m, useAnimate, useReducedMotion } from "motion/react";
import clsx from "clsx";
import { submitContact } from "@/app/actions/contact";
import { Shine } from "@/components/motion/Shine";
import { initialContactState, type ContactField } from "@/lib/contact";

const control =
  "w-full rounded-[10px] border bg-[rgba(187,187,187,0.15)] p-3 text-[16px] leading-[1.2] tracking-normal text-white transition-[border-color,background-color] duration-300 ease-framer placeholder:text-slate placeholder:opacity-100 focus:border-line focus:bg-[rgba(187,187,187,0.18)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-60";

const FIELDS: {
  key: ContactField;
  id: string;
  name: string;
  label: string;
  type?: "text" | "email";
  placeholder: string;
  autoComplete?: string;
}[] = [
  { key: "name", id: "contact-name", name: "Name", label: "Name", type: "text", placeholder: "Jane Smith", autoComplete: "name" },
  { key: "email", id: "contact-email", name: "Email", label: "Email", type: "email", placeholder: "yourname@gmail.com", autoComplete: "email" },
  { key: "message", id: "contact-message", name: "Message", label: "Your Message", placeholder: "Enter your message" },
];

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialContactState);
  const [scope, animate] = useAnimate<HTMLFormElement>();
  const reduced = useReducedMotion();

  // Each failed submission gives the invalid fields a short horizontal shake.
  useEffect(() => {
    if (reduced || state.status !== "error" || !scope.current?.querySelector("[aria-invalid=true]")) return;
    animate("[aria-invalid=true]", { x: [0, -7, 7, -5, 5, -2, 0] }, { duration: 0.45, ease: "easeOut" });
  }, [state, animate, scope, reduced]);

  return (
    <form
      ref={scope}
      id="contact-form"
      action={formAction}
      noValidate
      aria-busy={pending}
      className="z-[1] flex w-3/5 flex-col gap-5 rounded-3xl bg-ink p-6 shadow-form max-md:w-full max-md:p-5"
    >
      {FIELDS.map((field) => {
        const error = state.fieldErrors[field.key];
        const errorId = `${field.id}-error`;
        const shared = {
          id: field.id,
          name: field.name,
          placeholder: field.placeholder,
          defaultValue: state.values[field.key],
          disabled: pending,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? errorId : undefined,
        };
        const border = error ? "border-danger/70" : "border-[rgba(136,136,136,0.1)]";

        return (
          <label key={field.id} htmlFor={field.id} className="flex flex-col gap-2.5">
            <span className="text-body text-white">{field.label}</span>
            {field.type ? (
              <input {...shared} type={field.type} autoComplete={field.autoComplete} className={clsx(control, border, "h-11")} />
            ) : (
              <textarea {...shared} className={clsx(control, border, "h-[140px] min-h-[140px] resize-y")} />
            )}
            {error && (
              <span id={errorId} className="-mt-1 text-credit text-danger">
                {error}
              </span>
            )}
          </label>
        );
      })}

      <button
        type="submit"
        disabled={pending}
        className="group/btn relative isolate inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-[10px] border-0 bg-white px-6 py-3 text-btn font-medium text-ink shadow-none transition-[background-color,box-shadow,opacity] duration-[220ms] ease-out hover:bg-light hover:text-ink active:scale-[0.97] active:bg-[rgb(235,235,235)] disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-white"
      >
        <Shine tone="dark" />
        {pending && (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink motion-reduce:animate-none"
          />
        )}
        {pending ? "Sending…" : "Submit"}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={clsx(
          "m-0 text-small empty:hidden",
          state.status === "success" && "flex items-center gap-2 text-green",
          state.status === "error" && "text-danger",
        )}
      >
        {!pending && state.status === "success" && (
          <m.span
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="grid h-5 w-5 flex-none place-items-center rounded-full bg-green/15"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3">
              <m.path
                d="m3 6.2 2 2L9 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
              />
            </svg>
          </m.span>
        )}
        {!pending && state.message}
      </p>
    </form>
  );
}
