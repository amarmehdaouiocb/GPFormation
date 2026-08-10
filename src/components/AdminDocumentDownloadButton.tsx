"use client";

import { useState, useTransition } from "react";
import { DownloadSimple, SpinnerGap } from "@phosphor-icons/react";
import { createAdminDocumentDownload } from "@/app/admin/actions";
import type { RecoveryDocumentKind } from "@/lib/recovery-documents";

interface AdminDocumentDownloadButtonProps {
  reference: string;
  kind: RecoveryDocumentKind;
  label: string;
  detail: string;
}

export default function AdminDocumentDownloadButton({
  reference,
  kind,
  label,
  detail,
}: AdminDocumentDownloadButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function downloadDocument() {
    setError("");
    startTransition(async () => {
      const result = await createAdminDocumentDownload(reference, kind);

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      window.location.assign(result.downloadUrl);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={downloadDocument}
        disabled={isPending}
        className="group flex w-full items-center justify-between gap-4 border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.08em]">
            {label}
          </span>
          <span className="mt-1 block font-mono text-[0.6rem] text-zinc-500 transition-colors group-hover:text-zinc-400">
            {detail}
          </span>
        </span>
        {isPending ? (
          <SpinnerGap size={19} className="shrink-0 animate-spin" />
        ) : (
          <DownloadSimple size={19} className="shrink-0" />
        )}
      </button>
      {error ? <p className="mt-1 text-[0.65rem] text-red-600">{error}</p> : null}
    </div>
  );
}
