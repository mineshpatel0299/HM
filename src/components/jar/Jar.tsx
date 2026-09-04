"use client";

import { useState } from "react";
import { JarIllustration } from "./JarIllustration";
import { JarComposer } from "./JarComposer";
import { OpenNoteButton } from "./OpenNoteButton";

/** Ties the three jar pieces together so the illustration's dot count
 * updates live as notes are dropped in or opened, without either of them
 * needing to know about the others. */
export function Jar({
  coupleId,
  myId,
  myName,
  partnerName,
  initialUnopenedCount,
}: {
  coupleId: string;
  myId: string;
  myName: string;
  partnerName: string;
  initialUnopenedCount: number;
}) {
  const [unopenedCount, setUnopenedCount] = useState(initialUnopenedCount);

  return (
    <div className="flex flex-col items-center gap-4">
      <JarIllustration count={unopenedCount} />
      <OpenNoteButton
        coupleId={coupleId}
        myId={myId}
        myName={myName}
        partnerName={partnerName}
        onOpened={() => setUnopenedCount((count) => Math.max(0, count - 1))}
      />
      <JarComposer coupleId={coupleId} onDropped={() => setUnopenedCount((count) => count + 1)} />
    </div>
  );
}
