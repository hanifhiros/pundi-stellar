import type { ReactNode } from "react";

// Button sekarang menggunakan class dari globals.css (.btn, .btn-gold, dll)
// Komponen ini sebagai wrapper agar kode lama tetap bekerja.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "gold";
  children: ReactNode;
}

const variantClass: Record<string, string> = {
  primary:   "btn btn-gold",
  gold:      "btn btn-gold",
  secondary: "btn btn-outline",
  danger:    "btn",
  success:   "btn btn-gold",
  ghost:     "btn btn-ghost",
};

const variantStyle: Record<string, React.CSSProperties> = {
  danger: {
    background: "var(--error-bg)",
    color: "var(--error)",
    border: "1.5px solid var(--error-border)",
    borderRadius: 10,
  },
};

export function Button({
  variant = "primary",
  className = "",
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant] ?? "btn"} ${className}`}
      style={{ ...variantStyle[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
