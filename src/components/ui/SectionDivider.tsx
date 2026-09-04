type SectionDividerProps = {
  className?: string;
  /** Nudges the rule off-center for the asymmetric journal-page feel. */
  offset?: "none" | "left" | "right";
};

export function SectionDivider({
  className = "",
  offset = "none",
}: SectionDividerProps) {
  const offsetClass =
    offset === "left" ? "ml-8" : offset === "right" ? "mr-8" : "";

  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`h-px border-t border-dashed border-line ${offsetClass} ${className}`}
    />
  );
}
