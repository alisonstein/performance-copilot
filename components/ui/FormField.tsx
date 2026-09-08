import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, error, hint, id, name, className, ...props }: FormFieldProps) {
  const fieldId = id ?? name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        className={cn(
          "w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[15px] text-ink placeholder:text-ink-secondary/50 transition-colors focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light",
          error && "border-red-400/60 focus:border-red-400 focus:ring-red-400",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...props}
      />
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="text-xs text-ink-secondary">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface FormTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function FormTextArea({ label, error, id, name, className, ...props }: FormTextAreaProps) {
  const fieldId = id ?? name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        className={cn(
          "w-full resize-none rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[15px] text-ink placeholder:text-ink-secondary/50 transition-colors focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light",
          error && "border-red-400/60",
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
