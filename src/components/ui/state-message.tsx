import type { ReactNode } from "react";

interface StateMessageProps {
  icon: string;
  title: string;
  text: string;
  action?: ReactNode;
  role?: "alert" | "status";
}

/** Shared layout for error, empty and locked states. */
export function StateMessage({ icon, title, text, action, role }: StateMessageProps) {
  return (
    <div
      role={role}
      className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-10 text-center"
    >
      <span className="emoji text-6xl" aria-hidden="true">
        {icon}
      </span>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="text-ink-soft font-semibold">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
