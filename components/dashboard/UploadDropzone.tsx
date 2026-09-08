"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_CSV_FILE_SIZE_BYTES } from "@/lib/constants";

interface UploadDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDropzone({ file, onFileSelect, error }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    const selected = fileList?.[0];
    if (!selected) return;
    onFileSelect(selected);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
  }

  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.03] px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <FileSpreadsheet size={20} className="shrink-0 text-accent" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{file.name}</p>
            <p className="text-xs text-ink-secondary">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onFileSelect(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:text-ink"
          aria-label="Remover arquivo"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors",
          isDragging ? "border-primary-light bg-primary/[0.06]" : "border-border bg-white/[0.02]",
          error && "border-red-400/50"
        )}
      >
        <UploadCloud size={26} className="text-ink-secondary" />
        <p className="text-sm font-medium text-ink">
          Arraste o arquivo aqui ou <span className="text-primary-light">clique para selecionar</span>
        </p>
        <p className="text-xs text-ink-secondary">
          Exporte seus dados da plataforma e envie o arquivo aqui. Aceita .csv, até 10 MB.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Selecionar arquivo CSV"
      />
      {error ? <p className="mt-1.5 text-xs text-red-400">{error}</p> : null}
      <p className="mt-1.5 text-xs text-ink-secondary">Tamanho máximo: {formatFileSize(MAX_CSV_FILE_SIZE_BYTES)}</p>
    </div>
  );
}
