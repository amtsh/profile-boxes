import { useEffect, useRef } from "react";

interface InlineTextProps {
  value: string;
  editing: boolean;
  onCommit: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Bento-style inline editing: the text on the tile is the input.
 * Enter (single-line) or blur commits, Escape reverts.
 */
export function InlineText({
  value,
  editing,
  onCommit,
  placeholder,
  multiline = false,
  className = "",
  ariaLabel,
}: InlineTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reverting = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== value) el.textContent = value;
  }, [value, editing]);

  if (!editing) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      ref={ref}
      role="textbox"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-multiline={multiline}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder ?? ""}
      className={`inline-editable ${className}`}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          reverting.current = true;
          e.currentTarget.textContent = value;
          e.currentTarget.blur();
          return;
        }
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/\s+/g, " ");
        document.execCommand("insertText", false, text);
      }}
      onBlur={(e) => {
        if (reverting.current) {
          reverting.current = false;
          return;
        }
        const next = (e.currentTarget.textContent ?? "").trim();
        if (next !== value) onCommit(next);
      }}
    />
  );
}
