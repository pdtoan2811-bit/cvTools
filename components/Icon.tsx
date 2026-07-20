import { COLORS, ICONS } from "@/lib/icon-data";

/**
 * Inline SVG icon. Brand marks render in their official color; line icons
 * inherit currentColor so they take on the CV's accent.
 */
export function Icon({ name, className = "ic" }: { name: string; className?: string }) {
  const ic = ICONS[name];
  if (!ic) return null;

  const color = COLORS[name];
  const style = color ? { color } : undefined;

  if (ic.fill) {
    return (
      <svg
        className={className}
        viewBox={ic.vb}
        style={style}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: ic.fill }}
      />
    );
  }
  return (
    <svg className={className} viewBox={ic.vb} style={style} aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: ic.stroke ?? "" }}
      />
    </svg>
  );
}
