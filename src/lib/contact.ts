export type ContactField = "name" | "email" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<ContactField, string>>;
  /** Echoed back on error so the form keeps what the visitor typed. */
  values: Record<ContactField, string>;
};

export const initialContactState: ContactState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: { name: "", email: "", message: "" },
};
