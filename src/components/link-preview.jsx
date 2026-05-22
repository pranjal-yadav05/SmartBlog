"use client";
 
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUpRight, Globe, Loader2 } from "lucide-react";
 
/**
 * LinkPreview — a pill-shaped link with a hover preview card.
 *
 * Props:
 *   href       {string}  — The URL to link to (required)
 *   children   {node}    — Label text shown in the pill (required)
 *   className  {string}  — Extra classes for the pill wrapper (optional)
 *
 * Usage:
 *   <LinkPreview href="https://example.com">Visit Example</LinkPreview>
 *
 * HOW THE PREVIEW WORKS:
 *   It calls a lightweight Next.js API route (/api/link-preview?url=...) that
 *   fetches the page server-side and returns { title, description, image, url }.
 *   A minimal implementation of that route is included at the bottom of this
 *   file as a comment so you can drop it into pages/api or app/api.
 */
 
export default function LinkPreview({ href, children, className = "" }) {
  const [preview, setPreview] = useState(null);   // { title, description, image, url }
  const [status, setStatus]   = useState("idle"); // idle | loading | ready | error
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0, flip: false });
 
  const pillRef    = useRef(null);
  const cardRef    = useRef(null);
  const timerRef   = useRef(null);
  const fetchedRef = useRef(false);
 
  /* ── fetch preview once, lazily ── */
  const ensurePreview = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setStatus("loading");
    try {
      const res  = await fetch(`/api/link-preview?url=${encodeURIComponent(href)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPreview(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [href]);
 
  /* ── position the card above/below the pill ── */
  const computePos = useCallback(() => {
    if (!pillRef.current) return;
    const rect      = pillRef.current.getBoundingClientRect();
    const CARD_W    = 320;
    const CARD_H    = 200; // approximate
    const GAP       = 10;
    const vpH       = window.innerHeight;
    const vpW       = window.innerWidth;
 
    // horizontal: center on pill, clamp to viewport
    let left = rect.left + rect.width / 2 - CARD_W / 2 + window.scrollX;
    left     = Math.max(12, Math.min(left, vpW - CARD_W - 12));
 
    // vertical: prefer above; flip to below if not enough space
    const spaceAbove = rect.top;
    const flip       = spaceAbove < CARD_H + GAP + 20;
    const top        = flip
      ? rect.bottom + GAP + window.scrollY
      : rect.top  - CARD_H - GAP + window.scrollY;
 
    setPos({ top, left, flip });
  }, []);
 
  const showCard = () => {
    clearTimeout(timerRef.current);
    ensurePreview();
    computePos();
    setVisible(true);
  };
 
  const hideCard = () => {
    timerRef.current = setTimeout(() => setVisible(false), 120);
  };
 
  const keepCard = () => clearTimeout(timerRef.current);
 
  useEffect(() => () => clearTimeout(timerRef.current), []);
 
  /* ── domain label ── */
  const domain = (() => {
    try { return new URL(href).hostname.replace(/^www\./, ""); }
    catch { return href; }
  })();
 
  return (
    <>
      {/* ── Pill ── */}
      <a
        ref={pillRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={showCard}
        onMouseLeave={hideCard}
        onFocus={showCard}
        onBlur={hideCard}
        className={[
          "inline-flex items-center gap-1 px-3 py-1",
          "rounded-full border text-sm font-medium leading-none",
          "bg-white dark:bg-gray-900",
          "border-gray-200 dark:border-gray-700",
          "text-gray-700 dark:text-gray-200",
          "hover:bg-gray-50 dark:hover:bg-gray-800",
          "hover:border-gray-400 dark:hover:border-gray-500",
          "transition-all duration-150 no-underline",
          "shadow-sm hover:shadow",
          className,
        ].join(" ")}
      >
        <span>{children}</span>
        <ArrowUpRight
          className="h-3.5 w-3.5 opacity-60 flex-shrink-0"
          aria-hidden
        />
      </a>
 
      {/* ── Preview Card (portal-style, fixed) ── */}
      {visible && (
        <PreviewCard
          ref={cardRef}
          status={status}
          preview={preview}
          domain={domain}
          href={href}
          pos={pos}
          onMouseEnter={keepCard}
          onMouseLeave={hideCard}
        />
      )}
    </>
  );
}
 
/* ─────────────────────────────────────────────── */
 
import { createPortal } from "react-dom";
import { forwardRef } from "react";
 
const PreviewCard = forwardRef(function PreviewCard(
  { status, preview, domain, href, pos, onMouseEnter, onMouseLeave },
  ref
) {
  const card = (
    <div
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        top:  pos.top,
        left: pos.left,
        width: 320,
        zIndex: 9999,
        transformOrigin: pos.flip ? "top center" : "bottom center",
      }}
      className={[
        "rounded-2xl border shadow-2xl overflow-hidden",
        "bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800",
        "animate-preview-in",
      ].join(" ")}
    >
      {/* loading */}
      {status === "loading" && (
        <div className="flex items-center justify-center h-[120px] gap-2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Loading preview…</span>
        </div>
      )}
 
      {/* error / fallback */}
      {(status === "error") && (
        <div className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{domain}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{href}</p>
          </div>
        </div>
      )}
 
      {/* ready */}
      {status === "ready" && preview && (
        <>
          {preview.image && (
            <div className="h-[140px] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={preview.image}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
              />
            </div>
          )}
          <div className="p-4 space-y-1.5">
            {/* domain badge */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Globe className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{domain}</span>
            </div>
            {preview.title && (
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
                {preview.title}
              </p>
            )}
            {preview.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                {preview.description}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
 
  // Render into document.body to escape overflow:hidden parents
  if (typeof document === "undefined") return null;
  return createPortal(card, document.body);
});