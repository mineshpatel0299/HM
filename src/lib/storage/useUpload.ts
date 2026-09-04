"use client";

import { useCallback, useState } from "react";

type UploadStatus = "idle" | "requesting" | "uploading" | "done" | "error";

export type UploadResult = { publicUrl: string; key: string };

type UseUploadResult = {
  status: UploadStatus;
  progress: number;
  publicUrl: string | null;
  /** The R2 object key — needed by anything that stores a reference to this
   * upload in the DB (photos, time capsule attachments), since a table
   * should own its own key rather than parsing one back out of a URL. */
  key: string | null;
  error: string | null;
  upload: (file: File | Blob, fileName?: string) => Promise<UploadResult | null>;
  reset: () => void;
};

function putWithProgress(
  url: string,
  file: File | Blob,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

function extFromFile(file: File | Blob, fileName?: string): string {
  const name = fileName ?? (file instanceof File ? file.name : "");
  const fromName = name.includes(".") ? name.split(".").pop() : null;
  if (fromName) return fromName;
  const fromType = file.type.includes("/") ? file.type.split("/").pop() : null;
  return fromType || "bin";
}

/**
 * Requests a presigned R2 URL for `feature` (scoped to `coupleId` by
 * assertCoupleMember on the server) and PUTs the file directly to R2 from
 * the browser, reporting upload progress along the way.
 */
export function useUpload(coupleId: string, feature: string): UseUploadResult {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setPublicUrl(null);
    setKey(null);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File | Blob, fileName?: string): Promise<UploadResult | null> => {
      setStatus("requesting");
      setProgress(0);
      setError(null);
      setPublicUrl(null);
      setKey(null);

      const contentType = file.type || "application/octet-stream";
      const ext = extFromFile(file, fileName);

      try {
        const response = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coupleId, feature, contentType, ext }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Couldn't get an upload URL.");
        }

        const {
          uploadUrl,
          publicUrl: finalUrl,
          key: finalKey,
        } = (await response.json()) as {
          uploadUrl: string;
          publicUrl: string;
          key: string;
        };

        setStatus("uploading");
        await putWithProgress(uploadUrl, file, contentType, setProgress);

        setStatus("done");
        setPublicUrl(finalUrl);
        setKey(finalKey);
        return { publicUrl: finalUrl, key: finalKey };
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Upload failed.");
        return null;
      }
    },
    [coupleId, feature],
  );

  return { status, progress, publicUrl, key, error, upload, reset };
}
