"use client";

import { useEffect } from "react";

// Replaces the entire root layout, so it renders its own <html>/<body> and
// avoids next/font or any other module that could itself be implicated in
// whatever broke the root layout — this is the last-resort screen.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          backgroundColor: "#FBF3E7",
          color: "#241934",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: "1.5rem" }}>something didn&apos;t load right</p>
        <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>
          that&apos;s on us, not you — give it another try.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: "1rem",
            padding: "0.75rem 1.25rem",
            fontSize: "0.875rem",
            backgroundColor: "#A94F63",
            color: "#FBF3E7",
            border: "none",
            cursor: "pointer",
          }}
        >
          try again
        </button>
      </body>
    </html>
  );
}
