import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export function fieldErrorId(id: string): string {
  return `${id}-error`;
}

/** Label + control + validation message. The control must use `htmlFor` as its id. */
export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-extrabold">
        {label}
      </label>
      {children}
      {error && (
        <p
          id={fieldErrorId(htmlFor)}
          role="alert"
          className="text-coral text-sm font-bold"
        >
          {error}
        </p>
      )}
    </div>
  );
}
