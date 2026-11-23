"use server";

import { initialContactState, type ContactField, type ContactState } from "@/lib/contact";

const LIMITS = { name: 100, email: 254, message: 5000 } as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function read(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validate(values: Record<ContactField, string>) {
  const errors: Partial<Record<ContactField, string>> = {};
  if (!values.name) errors.name = "Please enter your name.";
  else if (values.name.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer.`;

  if (!values.email) errors.email = "Please enter your email.";
  else if (values.email.length > LIMITS.email || !EMAIL_PATTERN.test(values.email)) errors.email = "Please enter a valid email address.";

  if (!values.message) errors.message = "Please write a short message.";
  else if (values.message.length < 10) errors.message = "Your message should be at least 10 characters.";
  else if (values.message.length > LIMITS.message) errors.message = `Message must be ${LIMITS.message} characters or fewer.`;
  return errors;
}

/**
 * Delivers the message via Resend when RESEND_API_KEY is configured; otherwise logs it to the
 * server console so the form is fully testable in development.
 */
async function deliver({ name, email, message }: Record<ContactField, string>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[contact] RESEND_API_KEY not set — logging submission instead of sending:", { name, email, message });
    return;
  }

  const to = process.env.CONTACT_TO_EMAIL || "adeeb2002alsalh@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Resend responded with ${response.status}: ${await response.text()}`);
}

export async function submitContact(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const values: Record<ContactField, string> = {
    name: read(formData, "Name"),
    email: read(formData, "Email"),
    message: read(formData, "Message"),
  };

  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  try {
    await deliver(values);
  } catch (error) {
    console.error("[contact] Failed to deliver message:", error);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again or email me directly.",
      fieldErrors: {},
      values,
    };
  }

  return { ...initialContactState, status: "success", message: "Thanks! Your message is on its way — I'll reply within 24 hours." };
}
